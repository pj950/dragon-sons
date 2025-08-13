import { Balance, Element, EntityId, GroundFruit, GroundItem, Monster, Player, Position, WorldEntity } from "./types";
import { ELEMENTS } from "./elements";

export interface WorldState {
  tick: number;
  radius: number; // current safe radius
  center: Position;
  players: Map<string, Player>;
  entities: Map<EntityId, WorldEntity>;
  nextShrinkIndex: number;
  lastMobSpawnAt: number;
}

export interface WorldConfig {
  width: number;
  height: number;
  initialRadius: number;
}

export class World {
  public state: WorldState;
  private balance: Balance;
  private cfg: WorldConfig;

  constructor(cfg: WorldConfig, balance: Balance) {
    this.cfg = cfg;
    this.balance = balance;
    this.state = {
      tick: 0,
      radius: cfg.initialRadius,
      center: { x: cfg.width / 2, y: cfg.height / 2 },
      players: new Map(),
      entities: new Map(),
      nextShrinkIndex: 0,
      lastMobSpawnAt: 0,
    };
  }

  addPlayer(p: Player) {
    this.state.players.set(p.id, p);
  }

  removePlayer(id: string) {
    this.state.players.delete(id);
  }

  update(dtSec: number, nowMs: number) {
    this.state.tick += 1;
    this.applyShrink(dtSec);
    this.updatePlayers(dtSec, nowMs);
    this.spawnMobsIfNeeded();
  }

  handlePickup(playerId: string) {
    const p = this.state.players.get(playerId);
    if (!p) return;
    for (const [id, e] of this.state.entities) {
      const d2 = (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
      if (d2 <= 1.0) {
        if (e.type === "fruit") {
          // Convert to a flat attack gain for demo
          p.fruitAtkFlat = Math.min(p.fruitAtkFlat + 8, 64);
        } else if (e.type === "item") {
          if (e.itemId === "invuln") p.invulnUntil = Date.now() + 5000;
          if (e.itemId === "boots") {
            p.speedUntil = Date.now() + 6000;
            p.speedMultiplier = Math.max(p.speedMultiplier ?? 1, 2);
          }
        }
        this.state.entities.delete(id);
        break;
      }
    }
  }

  computeZoneElement(pos: Position): Element {
    // Divide circle into 5 equal angular sectors starting from +X axis
    const dx = pos.x - this.state.center.x;
    const dy = pos.y - this.state.center.y;
    let theta = Math.atan2(dy, dx); // -PI..PI
    if (theta < 0) theta += Math.PI * 2; // 0..2PI
    const sector = Math.floor((theta / (2 * Math.PI)) * 5) % 5;
    return ELEMENTS[sector];
  }

  private applyShrink(_dtSec: number) {
    const idx = this.state.nextShrinkIndex;
    if (idx >= this.balance.ringShrinkTimes.length) return;
    const tSec = this.state.tick / this.balance.tickRate;
    const nextAt = this.balance.ringShrinkTimes[idx];
    if (tSec >= nextAt) {
      this.state.radius *= this.balance.ringShrinkFactor;
      this.state.nextShrinkIndex += 1;
    }
  }

  private updatePlayers(_dtSec: number, nowMs: number) {
    const baseSpeed = this.balance.baseMove;
    for (const p of this.state.players.values()) {
      const mult = (p.speedUntil && nowMs < p.speedUntil ? (p.speedMultiplier ?? 2) : 1);
      p.x += p.vx * baseSpeed * mult / this.balance.tickRate;
      p.y += p.vy * baseSpeed * mult / this.balance.tickRate;
      // clamp to map bounds
      p.x = Math.max(0, Math.min(this.cfg.width, p.x));
      p.y = Math.max(0, Math.min(this.cfg.height, p.y));
      // refresh zone element
      p.zoneElement = this.computeZoneElement(p);
      // ring damage if outside
      const dx = p.x - this.state.center.x;
      const dy = p.y - this.state.center.y;
      const dist = Math.hypot(dx, dy);
      if (dist > this.state.radius) {
        const stage = Math.max(0, this.state.nextShrinkIndex - 1);
        const dps = this.balance.stormDpsPct[Math.min(stage, this.balance.stormDpsPct.length - 1)] * p.maxHp;
        p.hp = Math.max(0, p.hp - dps / this.balance.tickRate);
      }
      if (p.invulnUntil && nowMs >= p.invulnUntil) p.invulnUntil = undefined;
      if (p.speedUntil && nowMs >= p.speedUntil) {
        p.speedUntil = undefined;
        p.speedMultiplier = 1;
      }
    }
  }

  private spawnMobsIfNeeded() {
    const tSec = this.state.tick / this.balance.tickRate;
    if (tSec - this.state.lastMobSpawnAt < this.balance.mobSpawnEvery) return;
    this.state.lastMobSpawnAt = tSec;
    for (let i = 0; i < 3; i++) {
      const m: Monster = {
        id: uid(),
        type: "monster",
        element: ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)],
        x: this.randomBetween(0, this.cfg.width),
        y: this.randomBetween(0, this.cfg.height),
        hp: 50,
        maxHp: 50,
      };
      this.state.entities.set(m.id, m);
      // also drop a fruit next to it (for demo)
      const f: GroundFruit = {
        id: uid(),
        type: "fruit",
        element: m.element,
        x: Math.max(0, Math.min(this.cfg.width, m.x + (Math.random() - 0.5) * 2)),
        y: Math.max(0, Math.min(this.cfg.height, m.y + (Math.random() - 0.5) * 2)),
      };
      this.state.entities.set(f.id, f);
      // 10% item
      if (Math.random() < this.balance.itemDropChance) {
        const it: GroundItem = {
          id: uid(),
          type: "item",
          itemId: Math.random() < 0.5 ? "invuln" : "boots",
          x: Math.max(0, Math.min(this.cfg.width, m.x + (Math.random() - 0.5) * 4)),
          y: Math.max(0, Math.min(this.cfg.height, m.y + (Math.random() - 0.5) * 4)),
        };
        this.state.entities.set(it.id, it);
      }
    }
  }

  snapshot() {
    return {
      tick: this.state.tick,
      radius: this.state.radius,
      center: this.state.center,
      players: Array.from(this.state.players.values()).map(p => ({
        id: p.id, x: p.x, y: p.y, hp: p.hp, maxHp: p.maxHp, element: p.element, zone: p.zoneElement,
      })),
      entities: Array.from(this.state.entities.values()),
    };
  }

  private randomBetween(a: number, b: number): number {
    return a + Math.random() * (b - a);
  }
}

function uid(): string { return Math.random().toString(36).slice(2, 10); }