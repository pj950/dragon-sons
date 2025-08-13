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
  - `{ t: "rooms" }` 获取房间列表
  - `{ t: "createRoom", id: string }` 创建房间
  - `{ t: "joinRoom", id: string }` 加入房间（容量限制）
  - `{ t: "spectate" }` 切入观战
  - `{ t: "move", vx: number, vy: number }` (throttled ~30/s)
  - `{ t: "pickup" }`
  - `{ t: "useItem", itemId: string }`
  - `{ t: "assignSlot", slot: number, itemId: string }`
  - `{ t: "useSlot", slot: number }`
  - `{ t: "attack", target: string }` 目标可为玩家ID或怪物实体ID
  - `{ t: "cast", skillId: string, target: string }` 目标可为玩家ID或怪物实体ID
- Server -> Client
  - `{ t: "pong" }`
  - `{ t: "hello", id, element, room }`
  - `{ t: "rooms", rooms: string[] }`
  - `{ t: "roomCreated", id }`
  - `{ t: "joined", id }`
  - `{ t: "hit", from, damage, hp, skill? }`
  - `{ t: "snapshot", s, room }`