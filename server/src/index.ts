import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import configJson from "./config/balance.json";
import { DEFAULT_ELEMENT_MATRIX } from "./game/elements";
import type { Balance, Config, Player, Element } from "./game/types";
import { computeDamage } from "./game/combat";

const PORT = Number(process.env.PORT ?? 8787);

const config = configJson as unknown as Config;
const balance: Balance = config.balance as Balance;

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
  };

  const state: ClientState = { id, ws, player, lastPing: Date.now() };
  clients.set(id, state);

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
  });
});

function handleMessage(state: ClientState, msg: any) {
  if (msg?.t === "ping") {
    state.lastPing = Date.now();
    state.ws.send(JSON.stringify({ t: "pong" }));
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
    target.ws.send(JSON.stringify({ t: "hit", from: state.id, damage }));
  }
}

setInterval(() => {
  // liveness check & simple broadcast
  const now = Date.now();
  for (const s of clients.values()) {
    if (now - s.lastPing > 30000) {
      try { s.ws.terminate(); } catch {}
      clients.delete(s.id);
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