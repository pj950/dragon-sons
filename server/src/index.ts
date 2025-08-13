import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import configJson from "./config/balance.json";
import { DEFAULT_ELEMENT_MATRIX } from "./game/elements";
import type { Balance, Config, Player, Element, CharacterDef } from "./game/types";
import { computeDamage } from "./game/combat";
import { World } from "./game/world";

const PORT = Number(process.env.PORT ?? 8787);

const config = configJson as unknown as Config;
const balance: Balance = config.balance as Balance;

const world = new World({ width: 100, height: 100, initialRadius: 50 }, balance);

const server = http.createServer();
const wss = new WebSocketServer({ server });

interface ClientState {
  id: string;
  ws: WebSocket;
  player: Player;
  lastPing: number;
}

const clients = new Map<string, ClientState>();

function pickCharacter(): CharacterDef {
  const list = config.characters;
  return list[Math.floor(Math.random() * list.length)];
}

wss.on("connection", (ws: WebSocket) => {
  const id = generateId();
  const baseChar = pickCharacter();
  const element: Element = (baseChar.element === "random" ? pickRandom(config.elements) : baseChar.element) as Element;
  const player: Player = {
    id,
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
  };
  player.zoneElement = world.computeZoneElement(player);

  const state: ClientState = { id, ws, player, lastPing: Date.now() };
  clients.set(id, state);
  world.addPlayer(player);

  ws.send(JSON.stringify({ t: "hello", id, element: player.element }));

  ws.on("message", (data: Buffer) => {
    try {
      const msg = JSON.parse(data.toString());
      handleMessage(state, msg);
    } catch (err) {
      // ignore invalid payloads
    }
  });

  ws.on("close", () => {
    clients.delete(id);
    world.removePlayer(id);
  });
});

function handleMessage(state: ClientState, msg: any) {
  const now = Date.now();
  if (msg?.t === "ping") {
    state.lastPing = now;
    state.ws.send(JSON.stringify({ t: "pong" }));
    return;
  }
  if (msg?.t === "move") {
    // throttle: max 30 move msgs per second per client
    if ((state as any)._lastMoveAt && now - (state as any)._lastMoveAt < 33) return;
    (state as any)._lastMoveAt = now;
    const { vx = 0, vy = 0 } = msg;
    state.player.vx = Math.max(-1, Math.min(1, Number(vx) || 0));
    state.player.vy = Math.max(-1, Math.min(1, Number(vy) || 0));
    return;
  }
  if (msg?.t === "pickup") {
    world.handlePickup(state.id);
    return;
  }
  if (msg?.t === "useItem" && typeof msg.itemId === "string") {
    const item = config.items.find(i => i.id === msg.itemId);
    if (!item) return;
    if ((item.trigger ?? "onUse") !== "onUse") return;
    const have = state.player.bag[item.id] ?? 0;
    if (have <= 0) return;
    const next = state.player.cooldowns[item.id] ?? 0;
    if (now < next) return;
    // apply effect
    if (item.type === "invulnerable") state.player.invulnUntil = now + (item.duration ?? 5) * 1000;
    if (item.type === "speed") {
      state.player.speedUntil = now + (item.duration ?? 6) * 1000;
      state.player.speedMultiplier = Math.max(state.player.speedMultiplier ?? 1, item.multiplier ?? 2);
    }
    state.player.cooldowns[item.id] = now + (item.cooldown ?? 90) * 1000;
    state.player.bag[item.id] = have - 1;
    return;
  }
  if (msg?.t === "attack" && typeof msg.target === "string") {
    // throttle attacks by cooldown
    if (state.player.lastAttackAt && now - state.player.lastAttackAt < balance.attackCooldownMs) return;
    state.player.lastAttackAt = now;
    const target = clients.get(msg.target);
    if (!target) return;
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
}

// world loop and snapshot broadcast
setInterval(() => {
  const now = Date.now();
  world.update(1 / balance.tickRate, now);
  const snap = world.snapshot();
  const payload = JSON.stringify({ t: "snapshot", s: snap });
  for (const c of clients.values()) {
    if (c.ws.readyState === c.ws.OPEN) c.ws.send(payload);
  }
}, 1000 / balance.tickRate);

setInterval(() => {
  // liveness check
  const now = Date.now();
  for (const s of clients.values()) {
    if (now - s.lastPing > 30000) {
      try { s.ws.terminate(); } catch {}
      clients.delete(s.id);
      world.removePlayer(s.id);
    }
  }
}, 5000);

server.listen(PORT, () => {
  console.log(`dragon-sons server listening on :${PORT}`);
});

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}