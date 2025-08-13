import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import configJson from "./config/balance.json";
import { DEFAULT_ELEMENT_MATRIX } from "./game/elements";
import type { Balance, Config, Player, Element, CharacterDef, SkillDef } from "./game/types";
import { computeDamage } from "./game/combat";
import { World } from "./game/world";

const PORT = Number(process.env.PORT ?? 8787);

const config = configJson as unknown as Config;
const balance: Balance = config.balance as Balance;

// Room support (single default room + spectators)
interface Room {
  id: string;
  world: World;
  clients: Map<string, ClientState>;
  spectators: Set<string>;
}

const rooms = new Map<string, Room>();
function getOrCreateRoom(id = "default"): Room {
  let r = rooms.get(id);
  if (!r) {
    r = {
      id,
      world: new World({ width: 100, height: 100, initialRadius: 50 }, balance),
      clients: new Map(),
      spectators: new Set(),
    };
    rooms.set(id, r);
    startRoomLoops(r);
  }
  return r;
}

const server = http.createServer();
const wss = new WebSocketServer({ server });

interface ClientState {
  id: string;
  ws: WebSocket;
  player: Player | null;
  lastPing: number;
  roomId: string;
}

function pickCharacter(): CharacterDef {
  const list = config.characters;
  return list[Math.floor(Math.random() * list.length)];
}

wss.on("connection", (ws: WebSocket) => {
  const clientId = generateId();
  // join default room as player by default
  const room = getOrCreateRoom("default");

  // create player
  const baseChar = pickCharacter();
  const element: Element = (baseChar.element === "random" ? pickRandom(config.elements) : baseChar.element) as Element;
  const player: Player = {
    id: clientId,
    element,
    baseAtk: baseChar.atk,
    fruitAtkFlat: 0,
    def: baseChar.def,
    crit: baseChar.crit,
    critDmg: baseChar.critDmg,
    agi: baseChar.agi,
    dodge: baseChar.dodge,
    sameFruitStacks: {},
    x: Math.random() * 100,
    y: Math.random() * 100,
    vx: 0,
    vy: 0,
    hp: 100,
    maxHp: 100,
    speedMultiplier: 1,
    bag: {},
    cooldowns: {},
    slots: new Array(balance.slotCount ?? 3).fill(null),
  };
  player.zoneElement = room.world.computeZoneElement(player);

  const state: ClientState = { id: clientId, ws, player, lastPing: Date.now(), roomId: room.id };
  room.clients.set(clientId, state);
  room.world.addPlayer(player);

  ws.send(JSON.stringify({ t: "hello", id: clientId, element: player.element, room: room.id }));

  ws.on("message", (data: Buffer) => {
    try {
      const msg = JSON.parse(data.toString());
      handleMessage(room, state, msg);
    } catch (err) {
      // ignore invalid payloads
    }
  });

  ws.on("close", () => {
    room.clients.delete(clientId);
    if (state.player) room.world.removePlayer(clientId);
  });
});

function handleMessage(room: Room, state: ClientState, msg: any) {
  const now = Date.now();
  if (msg?.t === "ping") {
    state.lastPing = now;
    state.ws.send(JSON.stringify({ t: "pong" }));
    return;
  }
  if (msg?.t === "spectate") {
    room.spectators.add(state.id);
    state.player = null;
    return;
  }
  if (!state.player) return; // spectators ignore gameplay messages

  if (msg?.t === "move") {
    if ((state as any)._lastMoveAt && now - (state as any)._lastMoveAt < 33) return;
    (state as any)._lastMoveAt = now;
    const { vx = 0, vy = 0 } = msg;
    state.player.vx = Math.max(-1, Math.min(1, Number(vx) || 0));
    state.player.vy = Math.max(-1, Math.min(1, Number(vy) || 0));
    return;
  }
  if (msg?.t === "pickup") {
    room.world.handlePickup(state.id);
    return;
  }
  if (msg?.t === "assignSlot" && typeof msg.slot === "number" && typeof msg.itemId === "string") {
    const idx = msg.slot | 0;
    if (idx < 0 || idx >= state.player.slots.length) return;
    const count = state.player.bag[msg.itemId] ?? 0;
    if (count <= 0) return;
    state.player.slots[idx] = msg.itemId;
    return;
  }
  if (msg?.t === "useSlot" && typeof msg.slot === "number") {
    const idx = msg.slot | 0;
    if (idx < 0 || idx >= state.player.slots.length) return;
    const itemId = state.player.slots[idx];
    if (!itemId) return;
    return handleUseItem(state, { itemId }, now);
  }
  if (msg?.t === "useItem" && typeof msg.itemId === "string") {
    return handleUseItem(state, { itemId: msg.itemId }, now);
  }
  if (msg?.t === "attack" && typeof msg.target === "string") {
    const aspdMul = Math.min(balance.aspdCap, 1 + (state.player.agi - 100) * balance.agiAspdCoef);
    const cdMs = Math.max(100, Math.floor(balance.attackCooldownMs / aspdMul));
    if (state.player.lastAttackAt && now - state.player.lastAttackAt < cdMs) return;
    state.player.lastAttackAt = now;
    const target = room.clients.get(msg.target);
    if (!target || !target.player) return;
    const damage = computeDamage(
      { elementMatrix: DEFAULT_ELEMENT_MATRIX, balance },
      state.player,
      target.player,
      { id: "basic", power: 1 }
    );
    if (!target.player.invulnUntil || now >= target.player.invulnUntil) {
      target.player.hp = Math.max(0, target.player.hp - damage);
    }
    target.ws.send(JSON.stringify({ t: "hit", from: state.id, damage, hp: target.player.hp }));
    return;
  }
  if (msg?.t === "cast" && typeof msg.skillId === "string" && typeof msg.target === "string") {
    const skill = config.skills.find(s => s.id === msg.skillId);
    if (!skill) return;
    const next = state.player.cooldowns[skill.id] ?? 0;
    if (now < next) return;
    // casting time reduced by agility
    const castMul = 1 - Math.min(balance.castCap, Math.max(0, (state.player.agi - 100) * balance.agiCastCoef));
    const castMs = Math.max(50, Math.floor(skill.castMs * castMul));
    state.player.casting = { skillId: skill.id, targetId: String(msg.target), endAt: now + castMs };
    state.player.cooldowns[skill.id] = now + skill.cooldownMs;
    return;
  }
}

function handleUseItem(state: ClientState, msg: { itemId: string }, now: number) {
  const item = config.items.find(i => i.id === msg.itemId);
  if (!item) return;
  if ((item.trigger ?? "onUse") !== "onUse") return;
  const have = state.player!.bag[item.id] ?? 0;
  if (have <= 0) return;
  const next = state.player!.cooldowns[item.id] ?? 0;
  if (now < next) return;
  if (item.type === "invulnerable") state.player!.invulnUntil = now + (item.duration ?? 5) * 1000;
  if (item.type === "speed") {
    state.player!.speedUntil = now + (item.duration ?? 6) * 1000;
    state.player!.speedMultiplier = Math.max(state.player!.speedMultiplier ?? 1, item.multiplier ?? 2);
  }
  if (item.type === "heal") {
    state.player!.hp = Math.min(state.player!.maxHp, state.player!.hp + (item.healAmount ?? 30));
  }
  state.player!.cooldowns[item.id] = now + (item.cooldown ?? 90) * 1000;
  state.player!.bag[item.id] = have - 1;
}

function startRoomLoops(room: Room) {
  // world loop and snapshot broadcast
  setInterval(() => {
    const now = Date.now();
    room.world.update(1 / balance.tickRate, now);
    // resolve casts
    for (const cs of room.clients.values()) {
      const p = cs.player;
      if (!p || !p.casting) continue;
      if (now >= p.casting.endAt) {
        const skill = config.skills.find(s => s.id === p.casting!.skillId);
        const target = room.clients.get(p.casting!.targetId || "");
        if (skill && target && target.player) {
          const damage = computeDamage(
            { elementMatrix: DEFAULT_ELEMENT_MATRIX, balance },
            p,
            target.player,
            { id: skill.id, power: skill.power }
          );
          if (!target.player.invulnUntil || now >= target.player.invulnUntil) {
            target.player.hp = Math.max(0, target.player.hp - damage);
          }
          target.ws.send(JSON.stringify({ t: "hit", from: p.id, skill: skill.id, damage, hp: target.player.hp }));
        }
        p.casting = undefined;
      }
    }

    const snap = room.world.snapshot();
    const payload = JSON.stringify({ t: "snapshot", s: snap, room: room.id });
    for (const c of room.clients.values()) {
      if (c.ws.readyState === c.ws.OPEN) c.ws.send(payload);
    }
    for (const sid of room.spectators) {
      const s = room.clients.get(sid);
      if (s && s.ws.readyState === s.ws.OPEN) s.ws.send(payload);
    }
  }, 1000 / balance.tickRate);

  // liveness check
  setInterval(() => {
    const now = Date.now();
    for (const s of room.clients.values()) {
      if (now - s.lastPing > 30000) {
        try { s.ws.terminate(); } catch {}
        room.clients.delete(s.id);
        if (s.player) room.world.removePlayer(s.id);
      }
    }
  }, 5000);
}

server.listen(PORT, () => {
  console.log(`dragon-sons server listening on :${PORT}`);
});

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}