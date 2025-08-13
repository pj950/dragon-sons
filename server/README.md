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
  - `{ t: "move", vx: number, vy: number }` (throttled ~30/s)
  - `{ t: "pickup" }` (pick nearby entity)
  - `{ t: "useItem", itemId: string }` (consumes from bag, obeys cooldown)
  - `{ t: "attack", target: string }` (cooldown enforced)
- Server -> Client
  - `{ t: "pong" }`
  - `{ t: "hello", id, element }`
  - `{ t: "hit", from, damage, hp }`
  - `{ t: "snapshot", s }` (world snapshot)