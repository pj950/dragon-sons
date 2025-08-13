# Dragon Sons Server

Minimal authoritative server bootstrap for the Dragon Sons multiplayer game.

## Requirements
- Node.js >= 18

## Install
```bash
cd server
npm install
```

## Development
```bash
npm run dev
```

## Build & Run
```bash
npm run build
npm start
```

The server listens on port 8787 by default. Set `PORT` env to override.

## Protocol (WIP)
- Client -> Server
  - `{ t: "ping" }`
  - `{ t: "spectate" }` 切入观战（当前默认房间）
  - `{ t: "move", vx: number, vy: number }` (throttled ~30/s)
  - `{ t: "pickup" }` (pick nearby entity)
  - `{ t: "useItem", itemId: string }` (consumes from bag, obeys cooldown)
  - `{ t: "assignSlot", slot: number, itemId: string }`
  - `{ t: "useSlot", slot: number }`
  - `{ t: "attack", target: string }` (cooldown enforced; agility scales)
  - `{ t: "cast", skillId: string, target: string }` (有前摇与冷却)
- Server -> Client
  - `{ t: "pong" }`
  - `{ t: "hello", id, element, room }`
  - `{ t: "hit", from, damage, hp, skill? }`
  - `{ t: "snapshot", s, room }` (world snapshot)