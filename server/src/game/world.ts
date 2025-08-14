import { Balance, Element, EntityId, GroundFruit, GroundItem, Monster, Player, Position, WorldEntity } from "./types";
import { ELEMENTS } from "./elements";
import { applyFruit } from "./combat";

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
    this.updateMonsters(nowMs);
    this.updateProjectiles(nowMs);
    this.spawnMobsIfNeeded();
  }

  handlePickup(playerId: string) {
    const p = this.state.players.get(playerId);
    if (!p) return;
    for (const [id, e] of this.state.entities) {
      const d2 = (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
      if (d2 <= 1.0) {
        if (e.type === "fruit") {
          applyFruit(p, { element: e.element, selfAtkFlat: 8, other: this.mapFruitOther(e.element) }, this.balance);
        } else if (e.type === "item") {
          p.bag[e.itemId] = (p.bag[e.itemId] ?? 0) + 1;
        }
        this.state.entities.delete(id);
        break;
      }
    }
  }

  computeZoneElement(pos: Position): Element {
    const dx = pos.x - this.state.center.x;
    const dy = pos.y - this.state.center.y;
    let theta = Math.atan2(dy, dx);
    if (theta < 0) theta += Math.PI * 2;
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
    for (const p of this.state.players.values()) {
      const baseSpeed = this.balance.baseMove + (p.agi - 100) * this.balance.agiMoveCoef;
      const mult = (p.speedUntil && nowMs < p.speedUntil ? (p.speedMultiplier ?? 2) : 1);
      const speed = Math.max(0, baseSpeed) * mult;
      p.x += p.vx * speed / this.balance.tickRate;
      p.y += p.vy * speed / this.balance.tickRate;
      p.x = Math.max(0, Math.min(this.cfg.width, p.x));
      p.y = Math.max(0, Math.min(this.cfg.height, p.y));
      p.zoneElement = this.computeZoneElement(p);
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

  private updateMonsters(nowMs: number) {
    const spd = this.balance.monsterSpeed ?? 2;
    const aggro = this.balance.monsterAggroRange ?? 10;
    const atkRange = this.balance.monsterAttackRange ?? 1.5;
    const atkCd = this.balance.monsterAttackCooldownMs ?? 1200;
    const dmg = this.balance.monsterDamage ?? 10;

    for (const e of this.state.entities.values()) {
      if (e.type !== "monster") continue;
      let nearest: Player | null = null;
      let nd2 = Infinity;
      for (const p of this.state.players.values()) {
        const d2 = (p.x - e.x) ** 2 + (p.y - e.y) ** 2;
        if (d2 < nd2) { nd2 = d2; nearest = p; }
      }
      if (!nearest) continue;
      const dist = Math.sqrt(nd2);
      if (dist <= aggro) {
        const dirx = (nearest.x - e.x) / (dist || 1);
        const diry = (nearest.y - e.y) / (dist || 1);
        e.x += dirx * spd / this.balance.tickRate;
        e.y += diry * spd / this.balance.tickRate;
        if (dist <= atkRange && nowMs - e.lastAttackAt >= atkCd) {
          e.lastAttackAt = nowMs;
          nearest.hp = Math.max(0, nearest.hp - dmg);
        }
      }
    }

    // cleanup dead monsters and drop
    const toDelete: string[] = [];
    for (const [id, ent] of this.state.entities) {
      if (ent.type === "monster" && ent.hp <= 0) {
        toDelete.push(id);
        // drop fruit
        const f: GroundFruit = {
          id: uid(), type: "fruit", element: ent.element,
          x: ent.x, y: ent.y,
        };
        this.state.entities.set(f.id, f);
        // roll item
        if (Math.random() < (this.balance.itemDropChance ?? 0.1)) {
          const it: GroundItem = { id: uid(), type: "item", itemId: Math.random() < 0.5 ? "invuln" : "boots", x: ent.x, y: ent.y };
          this.state.entities.set(it.id, it);
        }
      }
    }
    for (const id of toDelete) this.state.entities.delete(id);
  }

  private updateProjectiles(nowMs: number) {
    // bombs explode
    const toDelete: string[] = [];
    for (const [id, e] of this.state.entities) {
      if (e.type === "bomb" && nowMs >= e.explodeAt) {
        for (const p of this.state.players.values()) {
          const d = Math.hypot(p.x - e.x, p.y - e.y);
          if (d <= e.radius) p.hp = Math.max(0, p.hp - e.damage);
        }
        toDelete.push(id);
      } else if (e.type === "trap") {
        for (const p of this.state.players.values()) {
          if (p.id === e.ownerId) continue;
          const d = Math.hypot(p.x - e.x, p.y - e.y);
          if (d <= e.radius) {
            p.hp = Math.max(0, p.hp - e.damage);
            toDelete.push(id);
            break;
          }
        }
      }
    }
    for (const id of toDelete) this.state.entities.delete(id);
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
        def: this.balance.monsterDef ?? 40,
        lastAttackAt: 0,
        mvx: 0,
        mvy: 0,
      };
      this.state.entities.set(m.id, m);
    }
  }

  useBomb(owner: Player) {
    const radius = this.balance.bombRadius ?? 3;
    const damage = this.balance.bombDamage ?? 50;
    const b = { id: uid(), type: "bomb" as const, ownerId: owner.id, x: owner.x, y: owner.y, explodeAt: Date.now() + 2000, radius, damage };
    this.state.entities.set(b.id, b);
  }

  useTrap(owner: Player) {
    const radius = this.balance.trapRadius ?? 2;
    const damage = this.balance.trapDamage ?? 30;
    const t = { id: uid(), type: "trap" as const, ownerId: owner.id, x: owner.x, y: owner.y, radius, damage };
    this.state.entities.set(t.id, t);
  }

  useBlink(owner: Player) {
    const dist = this.balance.blinkDistance ?? 6;
    const nx = Math.max(0, Math.min(this.cfg.width, owner.x + owner.vx * dist));
    const ny = Math.max(0, Math.min(this.cfg.height, owner.y + owner.vy * dist));
    owner.x = nx;
    owner.y = ny;
  }

  damageMonster(monsterId: string, amount: number) {
    const m = this.state.entities.get(monsterId);
    if (!m || m.type !== "monster") return;
    // simple mitigation by def
    const mit = 1 - (m.def / (m.def + (this.balance.kDef || 100)));
    m.hp = Math.max(0, m.hp - Math.max(1, Math.floor(amount * mit)));
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

  private mapFruitOther(element: Element) {
    switch (element) {
      case "metal": return { critRatePct: 0.02, max: 0.12 };
      case "wood": return { agiFlat: 5, max: 40 };
      case "water": return { dodgePct: 0.02, max: 0.12 };
      case "fire": return { critDmg: 0.10, max: 0.60 };
      case "earth": return { defFlat: 8, max: 64 };
    }
  }

  private randomBetween(a: number, b: number): number {
    return a + Math.random() * (b - a);
  }
}

function uid(): string { return Math.random().toString(36).slice(2, 10); }