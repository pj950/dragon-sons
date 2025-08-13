import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import configJson from "./config/balance.json";
import { DEFAULT_ELEMENT_MATRIX } from "./game/elements";
import type { Balance, Config, Player, Element } from "./game/types";
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

wss.on("connection", (ws: WebSocket) => {
  const id = generateId();
  const player: Player = {
    id,
    element: pickRandom(config.elements) as Element,
    baseAtk: 100,
    fruitAtkFlat: 0,
    def: 80,
    crit: 0.1,
    critDmg: 1.5,
    sameFruitStacks: {},
    x: Math.random() * 100,
    y: Math.random() * 100,
    vx: 0,
    vy: 0,
    hp: 100,
    maxHp: 100,
    speedMultiplier: 1,
  };

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
  if (msg?.t === "ping") {
    state.lastPing = Date.now();
    state.ws.send(JSON.stringify({ t: "pong" }));
    return;
  }
  if (msg?.t === "move") {
    const { vx = 0, vy = 0 } = msg;
    state.player.vx = Math.max(-1, Math.min(1, Number(vx) || 0));
    state.player.vy = Math.max(-1, Math.min(1, Number(vy) || 0));
    return;
  }
  if (msg?.t === "pickup") {
    world.handlePickup(state.id);
    return;
  }
  if (msg?.t === "attack" && typeof msg.target === "string") {
    const target = clients.get(msg.target);
    if (!target) return;
    const damage = computeDamage(
      { elementMatrix: DEFAULT_ELEMENT_MATRIX, balance },
      state.player,
      target.player,
      { id: "basic", power: 1 }
    );
    if (!target.player.invulnUntil || Date.now() >= target.player.invulnUntil) {
      target.player.hp = Math.max(0, target.player.hp - damage);
    }
    target.ws.send(JSON.stringify({ t: "hit", from: state.id, damage, hp: target.player.hp }));
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