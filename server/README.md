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

## Runtime config
- Default config path: `dist/config/config/balance.json`（可通过 `CONFIG_PATH` 指定）
- 支持热更新：文件变化时自动重载

## Protocol (WIP)
- Client -> Server
  - `{ t: "ping" }`
  - `{ t: "rooms" }` 获取房间列表
  - `{ t: "createRoom", id: string }` 创建房间
  - `{ t: "joinRoom", id: string }` 加入房间（容量限制）
  - `{ t: "spectate" }` 切入观战
  - `{ t: "start" }` 在 lobby 触发 5 秒倒计时
  - `{ t: "rejoin", token: string }` 断线重入（简化）
  - `{ t: "move", vx: number, vy: number }` (throttled ~30/s，含速度上限)
  - `{ t: "pickup" }`
  - `{ t: "useItem", itemId: string }`
  - `{ t: "assignSlot", slot: number, itemId: string }`
  - `{ t: "useSlot", slot: number }`
  - `{ t: "attack", target: string }`
  - `{ t: "cast", skillId: string, target: string }`
- Server -> Client
  - `{ t: "pong" }`
  - `{ t: "hello", id, element, room, token }`
  - `{ t: "rooms", rooms: string[] }`
  - `{ t: "roomCreated", id }`
  - `{ t: "joined", id }`
  - `{ t: "countdown", endAt }`
  - `{ t: "start" }`
  - `{ t: "hit", from, damage, hp, skill? }`
  - `{ t: "snapshot", s, room, match: { state, countdownEndAt, endAt, leaderboard } }`