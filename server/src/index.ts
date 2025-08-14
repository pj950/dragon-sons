import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { getConfig, getBalance, watchConfig } from "./config/runtime";
import { DEFAULT_ELEMENT_MATRIX } from "./game/elements";
import type { Balance, Config, Player, Element, CharacterDef } from "./game/types";
import { computeDamage } from "./game/combat";
import { World } from "./game/world";
import { initStore, loadLeaderboard, loadStats, saveLeaderboard, saveStats } from "./persist/store";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Room support (single default room + spectators)
interface Room {
  id: string;
  world: World;
  clients: Map<string, ClientState>;
  spectators: Set<string>;
  // match state
  state: "lobby" | "countdown" | "playing" | "ended";
  countdownEndAt?: number;
  endAt?: number;
  leaderboard: Array<{ id: string; kills: number; alive: boolean }>;
}

const rooms = new Map<string, Room>();
const rejoinStore = new Map<string, { savedAt: number; data: any }>();
function getOrCreateRoom(id = "default"): Room {
  let r = rooms.get(id);
  if (!r) {
    const balance = getBalance();
    r = {
      id,
      world: new World({ width: 100, height: 100, initialRadius: 50 }, balance),
      clients: new Map(),
      spectators: new Set(),
      state: "lobby",
      leaderboard: [],
    };
    rooms.set(id, r);
    startRoomLoops(r);
  }
  return r;
}

const httpServer = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  res.writeHead(404); res.end();
});
const wss = new WebSocketServer({ server: httpServer });
watchConfig();

interface ClientState {
  id: string;
  ws: WebSocket;
  player: Player | null;
  lastPing: number;
  roomId: string;
  token?: string;
  damageDealt?: number;
  trail?: Array<{ t: number; x: number; y: number }>;
}

function pickCharacter(): CharacterDef {
  const list = getConfig().characters;
  return list[Math.floor(Math.random() * list.length)];
}

wss.on("connection", async (ws: WebSocket) => {
  await initStore();
  const clientId = generateId();
  const token = generateId();
  const room = getOrCreateRoom("default");

  const baseChar = pickCharacter();
  const element: Element = (baseChar.element === "random" ? pickRandom(getConfig().elements) : baseChar.element) as Element;
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
    slots: new Array(getBalance().slotCount ?? 3).fill(null),
  };
  player.zoneElement = room.world.computeZoneElement(player);

  const state: ClientState = { id: clientId, ws, player, lastPing: Date.now(), roomId: room.id, token };
  room.clients.set(clientId, state);
  room.world.addPlayer(player);
  ensureLeaderboard(room, clientId);

  ws.send(JSON.stringify({ t: "hello", id: clientId, element: player.element, room: room.id, token }));

  ws.on("message", (data: Buffer) => {
    try {
      const msg = JSON.parse(data.toString());
      handleMessage(room, state, msg);
    } catch (err) {}
  });

  ws.on("close", () => {
    if (state.player) {
      const snap = serializePlayer(state.player);
      rejoinStore.set(state.token!, { savedAt: Date.now(), data: snap });
      if (process.env.PERSIST_REJOIN === "1") saveRejoinSnapshot(state.token!, snap);
    }
    room.clients.delete(clientId);
    if (state.player) room.world.removePlayer(clientId);
  });
});

function serializePlayer(p: Player) {
  return {
    element: p.element,
    baseAtk: p.baseAtk,
    fruitAtkFlat: p.fruitAtkFlat,
    def: p.def,
    crit: p.crit,
    critDmg: p.critDmg,
    agi: p.agi,
    dodge: p.dodge,
    x: p.x, y: p.y,
    hp: p.hp, maxHp: p.maxHp,
    speedMultiplier: p.speedMultiplier ?? 1,
    bag: p.bag,
    cooldowns: p.cooldowns,
    slots: p.slots,
    invulnUntil: p.invulnUntil,
    speedUntil: p.speedUntil,
    lastAttackAt: p.lastAttackAt,
  };
}

function applySnapshotToPlayer(p: Player, snap: any) {
  p.element = snap.element ?? p.element;
  p.baseAtk = snap.baseAtk ?? p.baseAtk;
  p.fruitAtkFlat = snap.fruitAtkFlat ?? p.fruitAtkFlat;
  p.def = snap.def ?? p.def;
  p.crit = snap.crit ?? p.crit;
  p.critDmg = snap.critDmg ?? p.critDmg;
  p.agi = snap.agi ?? p.agi;
  p.dodge = snap.dodge ?? p.dodge;
  p.x = snap.x ?? p.x; p.y = snap.y ?? p.y;
  p.hp = Math.max(0, Math.min(snap.hp ?? p.hp, snap.maxHp ?? p.maxHp));
  p.maxHp = snap.maxHp ?? p.maxHp;
  p.speedMultiplier = snap.speedMultiplier ?? p.speedMultiplier;
  p.bag = { ...(snap.bag ?? {}) };
  p.cooldowns = { ...(snap.cooldowns ?? {}) };
  p.slots = Array.isArray(snap.slots) ? snap.slots.slice() : p.slots;
  p.invulnUntil = snap.invulnUntil ?? p.invulnUntil;
  p.speedUntil = snap.speedUntil ?? p.speedUntil;
  p.lastAttackAt = snap.lastAttackAt ?? p.lastAttackAt;
}

function ensureLeaderboard(room: Room, id: string) {
  if (!room.leaderboard.find(e => e.id === id)) room.leaderboard.push({ id, kills: 0, alive: true });
}

function handleMessage(room: Room, state: ClientState, msg: any) {
  const now = Date.now();
  const cfg = getConfig();
  const balance = getBalance();
  // optional signature check
  const secret = process.env.MSG_SECRET;
  if (secret && msg?.sig) {
    const { sig, ...payload } = msg;
    const expect = simpleSig(JSON.stringify(payload), secret);
    if (sig !== expect) return;
  }
  if (msg?.t === "ping") {
    state.lastPing = now;
    state.ws.send(JSON.stringify({ t: "pong" }));
    return;
  }
  if (msg?.t === "leaderboard") {
    // global leaderboard with pagination
    (async () => {
      const sortBy = (msg.by === "kills" ? "kills" : "wins");
      const page = Math.max(0, Number(msg.page ?? 0));
      const size = Math.min(100, Math.max(1, Number(msg.size ?? 20)));
      const leaders = await loadLeaderboard();
      leaders.sort((a, b) => (sortBy === "wins" ? (b.wins - a.wins) || (b.kills - a.kills) : (b.kills - a.kills) || (b.wins - a.wins)));
      const start = page * size;
      state.ws.send(JSON.stringify({ t: "leaderboard", by: sortBy, page, size, total: leaders.length, items: leaders.slice(start, start + size) }));
    })();
    return;
  }
  if (msg?.t === "roomBoard") {
    const by = (msg.by === "damage" ? "damage" : msg.by === "kills" ? "kills" : "alive");
    const page = Math.max(0, Number(msg.page ?? 0));
    const size = Math.min(100, Math.max(1, Number(msg.size ?? 20)));
    const fId = (typeof msg.filterId === "string" ? msg.filterId : undefined);
    const rows: Array<{ id: string; kills: number; alive: boolean; damage: number }> = [];
    for (const e of room.leaderboard) {
      if (fId && e.id.indexOf(fId) === -1) continue;
      const cs = room.clients.get(e.id);
      rows.push({ id: e.id, kills: e.kills, alive: e.alive, damage: cs?.damageDealt ?? 0 });
    }
    rows.sort((a, b) => by === "kills" ? (b.kills - a.kills) : by === "damage" ? (b.damage - a.damage) : ((a.alive === b.alive) ? 0 : a.alive ? -1 : 1));
    const start = page * size;
    state.ws.send(JSON.stringify({ t: "roomBoard", by, page, size, total: rows.length, items: rows.slice(start, start + size) }));
    return;
  }
  if (msg?.t === "rejoin" && typeof msg.token === "string") {
    const ttl = Number(process.env.REJOIN_TTL_MS || 120000);
    const mem = rejoinStore.get(msg.token);
    const disk = process.env.PERSIST_REJOIN === "1" ? loadRejoinSnapshot(msg.token) : null;
    const entry = mem || disk;
    if (entry && now - entry.savedAt <= ttl && state.player) {
      applySnapshotToPlayer(state.player, entry.data);
      state.player.zoneElement = rooms.get(state.roomId)!.world.computeZoneElement(state.player);
      if (mem) rejoinStore.delete(msg.token);
      state.ws.send(JSON.stringify({ t: "rejoin_ok" }));
    } else {
      state.ws.send(JSON.stringify({ t: "rejoin_fail" }));
    }
    return;
  }
  if (msg?.t === "rooms") {
    state.ws.send(JSON.stringify({ t: "rooms", rooms: Array.from(rooms.keys()) }));
    return;
  }
  if (msg?.t === "createRoom" && typeof msg.id === "string") {
    if (rooms.has(msg.id)) return;
    getOrCreateRoom(msg.id);
    state.ws.send(JSON.stringify({ t: "roomCreated", id: msg.id }));
    return;
  }
  if (msg?.t === "joinRoom" && typeof msg.id === "string") {
    const r = rooms.get(msg.id);
    if (!r) return;
    if ((r.clients.size) >= (balance.roomCapacity ?? 16)) return;
    const cur = rooms.get(state.roomId);
    if (cur) {
      cur.clients.delete(state.id);
      if (state.player) cur.world.removePlayer(state.id);
    }
    state.roomId = r.id;
    r.clients.set(state.id, state);
    if (state.player) r.world.addPlayer(state.player);
    state.ws.send(JSON.stringify({ t: "joined", id: r.id }));
    return;
  }
  if (msg?.t === "spectate") {
    room.spectators.add(state.id);
    state.player = null;
    return;
  }
  if (msg?.t === "start" && room.state === "lobby") {
    room.state = "countdown";
    room.countdownEndAt = now + 5000;
    broadcast(room, { t: "countdown", endAt: room.countdownEndAt });
    return;
  }
  if (!state.player) return;

  if (msg?.t === "move") {
    if ((state as any)._lastMoveAt && now - (state as any)._lastMoveAt < 33) return;
    (state as any)._lastMoveAt = now;
    const { vx = 0, vy = 0 } = msg;
    // anti-cheat: cap speed vector magnitude
    const mag = Math.hypot(vx, vy);
    const cap = 1.2; // allow slight tolerance
    const scale = mag > cap ? cap / mag : 1;
    state.player.vx = Math.max(-1, Math.min(1, Number(vx) * scale || 0));
    state.player.vy = Math.max(-1, Math.min(1, Number(vy) * scale || 0));
    // audit trail
    if (!state.trail) state.trail = [];
    state.trail.push({ t: now, x: state.player.x, y: state.player.y });
    if (state.trail.length > 50) state.trail.shift();
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
    const targetPlayer = room.clients.get(msg.target);
    if (targetPlayer && targetPlayer.player) {
      const damage = computeDamage(
        { elementMatrix: DEFAULT_ELEMENT_MATRIX, balance },
        state.player,
        targetPlayer.player,
        { id: "basic", power: 1 }
      );
      if (!targetPlayer.player.invulnUntil || now >= targetPlayer.player.invulnUntil) {
        const before = targetPlayer.player.hp;
        targetPlayer.player.hp = Math.max(0, targetPlayer.player.hp - damage);
        const dealt = Math.max(0, before - targetPlayer.player.hp);
        state.damageDealt = (state.damageDealt ?? 0) + dealt;
        if (before > 0 && targetPlayer.player.hp <= 0) addKill(room, state.id);
      }
      targetPlayer.ws.send(JSON.stringify({ t: "hit", from: state.id, damage, hp: targetPlayer.player.hp }));
      return;
    }
    // if not a player id, try monster entity id
    const ent = room.world.state.entities.get(msg.target);
    if (ent && ent.type === "monster") {
      const damage = Math.max(1, state.player.baseAtk + state.player.fruitAtkFlat);
      room.world.damageMonster(ent.id, damage);
      return;
    }
    return;
  }
  if (msg?.t === "cast" && typeof msg.skillId === "string" && typeof msg.target === "string") {
    const skill = cfg.skills.find(s => s.id === msg.skillId);
    if (!skill) return;
    const next = state.player.cooldowns[skill.id] ?? 0;
    if (now < next) return;
    const castMul = 1 - Math.min(balance.castCap, Math.max(0, (state.player.agi - 100) * balance.agiCastCoef));
    const castMs = Math.max(50, Math.floor(skill.castMs * castMul));
    state.player.casting = { skillId: skill.id, targetId: String(msg.target), endAt: now + castMs };
    state.player.cooldowns[skill.id] = now + skill.cooldownMs;
    return;
  }
}

function handleUseItem(state: ClientState, msg: { itemId: string }, now: number) {
  const item = getConfig().items.find(i => i.id === msg.itemId);
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
  if (item.type === "heal") state.player!.hp = Math.min(state.player!.maxHp, state.player!.hp + (item.healAmount ?? 30));
  if (item.type === "bomb") rooms.get(state.roomId)!.world.useBomb(state.player!);
  if (item.type === "trap") rooms.get(state.roomId)!.world.useTrap(state.player!);
  if (item.type === "blink") rooms.get(state.roomId)!.world.useBlink(state.player!);

  state.player!.cooldowns[item.id] = now + (item.cooldown ?? 90) * 1000;
  state.player!.bag[item.id] = have - 1;
}

function broadcast(room: Room, payload: any) {
  const s = JSON.stringify(payload);
  for (const c of room.clients.values()) {
    if (c.ws.readyState === c.ws.OPEN) c.ws.send(s);
  }
}

function addKill(room: Room, killerId: string) {
  const e = room.leaderboard.find(x => x.id === killerId);
  if (e) e.kills += 1;
}

function startRoomLoops(room: Room) {
  setInterval(async () => {
    const now = Date.now();
    const balance = getBalance();
    const cfg = getConfig();

    // min players auto start/reset
    const minPlayers = Number(process.env.MIN_PLAYERS || 2);
    const activePlayers = Array.from(room.clients.values()).filter(c => !!c.player).length;
    if (room.state === "lobby" && activePlayers >= minPlayers) {
      room.state = "countdown";
      room.countdownEndAt = now + 5000;
      broadcast(room, { t: "countdown", endAt: room.countdownEndAt });
      logEvent(room.id, { type: "countdown", at: now, players: activePlayers });
    }
    if (room.state === "countdown" && activePlayers < minPlayers) {
      room.state = "lobby";
      room.countdownEndAt = undefined;
      broadcast(room, { t: "countdown_cancel" });
      logEvent(room.id, { type: "countdown_cancel", at: now, players: activePlayers });
    }

    if (room.state === "countdown" && room.countdownEndAt && now >= room.countdownEndAt) {
      room.state = "playing";
      room.endAt = now + 10 * 60_000;
      broadcast(room, { t: "start" });
      logEvent(room.id, { type: "start", at: now });
    }
    if (room.state === "playing" && room.endAt && now >= room.endAt) {
      room.state = "ended";
      await persistMatch(room);
      logEvent(room.id, { type: "end", at: now });
    }

    room.world.update(1 / balance.tickRate, now);

    // leaderboard update
    room.leaderboard.forEach(e => {
      const cs = room.clients.get(e.id);
      e.alive = !!(cs && cs.player && cs.player.hp > 0);
    });

    const snap = room.world.snapshot();
    const payload = JSON.stringify({ t: "snapshot", s: snap, room: room.id, match: { state: room.state, countdownEndAt: room.countdownEndAt, endAt: room.endAt, leaderboard: room.leaderboard } });
    for (const c of room.clients.values()) {
      if (c.ws.readyState === c.ws.OPEN) c.ws.send(payload);
    }
    for (const sid of room.spectators) {
      const s = room.clients.get(sid);
      if (s && s.ws.readyState === s.ws.OPEN) s.ws.send(payload);
    }
  }, 1000 / getBalance().tickRate);

  setInterval(() => {
    const now = Date.now();
    for (const s of room.clients.values()) {
      if (now - s.lastPing > 30000) {
        try { s.ws.terminate(); } catch {}
        room.clients.delete(s.id);
        if (s.player) room.world.removePlayer(s.id);
        logEvent(room.id, { type: "disconnect", id: s.id, at: now });
      }
    }
  }, 5000);
}

async function persistMatch(room: Room) {
  const stats = await loadStats();
  const alive = room.leaderboard.filter(e => e.alive);
  let winner: string | undefined;
  if (alive.length > 0) {
    alive.sort((a, b) => b.kills - a.kills);
    winner = alive[0].id;
  } else if (room.leaderboard.length > 0) {
    room.leaderboard.sort((a, b) => b.kills - a.kills);
    winner = room.leaderboard[0].id;
  }
  // MVP by damageDealt
  const byDamage: Array<{ id: string; damage: number }> = [];
  for (const c of room.clients.values()) {
    if (c.damageDealt) byDamage.push({ id: c.id, damage: c.damageDealt });
  }
  byDamage.sort((a, b) => b.damage - a.damage);
  const mvp = byDamage[0]?.id;

  for (const e of room.leaderboard) {
    const s = stats[e.id] || { id: e.id, matches: 0, wins: 0, kills: 0 };
    s.matches += 1;
    s.kills += e.kills;
    if (winner && e.id === winner) s.wins += 1;
    stats[e.id] = s;
  }
  await saveStats(stats);
  const leaders = await loadLeaderboard();
  for (const s of Object.values(stats)) {
    const idx = leaders.findIndex(l => l.id === s.id);
    const entry = { id: s.id, wins: s.wins, kills: s.kills };
    if (idx >= 0) leaders[idx] = entry; else leaders.push(entry);
  }
  leaders.sort((a, b) => (b.wins - a.wins) || (b.kills - a.kills));
  await saveLeaderboard(leaders);

  // broadcast final board to spectators
  broadcast(room, { t: "settlement", winner, mvp, leaders: leaders.slice(0, 20) });
}

httpServer.listen(Number(process.env.PORT ?? 8787), () => {
  console.log(`dragon-sons server listening on :${Number(process.env.PORT ?? 8787)}`);
});

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function logEvent(roomId: string, evt: any) {
  try {
    const line = JSON.stringify({ room: roomId, ...evt }) + "\n";
    fs.appendFileSync(pathJoinData("events.log"), line);
  } catch {}
}

function pathJoinData(name: string) {
  const dir = process.env.DATA_DIR || path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, name);
}

function simpleSig(body: string, secret: string): string {
  if (process.env.HMAC === "1") {
    return crypto.createHmac("sha256", secret).update(body).digest("hex");
  }
  let h = 0;
  for (let i = 0; i < body.length; i++) h = (h * 131 + body.charCodeAt(i)) >>> 0;
  for (let i = 0; i < secret.length; i++) h = (h * 131 + secret.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

// persist rejoin snapshots to disk
function saveRejoinSnapshot(token: string, data: any) {
  const dir = process.env.DATA_DIR || path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `rejoin-${token}.json`), JSON.stringify({ savedAt: Date.now(), data }), "utf8");
}
function loadRejoinSnapshot(token: string): { savedAt: number; data: any } | null {
  try {
    const dir = process.env.DATA_DIR || path.join(process.cwd(), "data");
    const txt = fs.readFileSync(path.join(dir, `rejoin-${token}.json`), "utf8");
    return JSON.parse(txt);
  } catch { return null; }
}