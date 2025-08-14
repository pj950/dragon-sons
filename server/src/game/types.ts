export type Element = "metal" | "wood" | "water" | "fire" | "earth";

export type ElementMatrix = Record<Element, Partial<Record<Element, number>>>;

export interface Balance {
  tickRate: number;
  baseMove: number;
  agiMoveCoef: number;
  agiAspdCoef: number;
  agiCastCoef: number;
  aspdCap: number;
  castCap: number;
  kDef: number;
  zoneBuffAtkPct: number;
  zoneDebuffDefPct: number;
  stormDpsPct: number[];
  ringShrinkTimes: number[];
  ringShrinkFactor: number;
  sameFruitAtkCap: number;
  sameFruitDiminishStart: number;
  sameFruitDiminishRate: number;
  mobSpawnEvery: number;
  itemDropChance: number;
  // combat caps
  baseHit: number;
  agiHitCoef: number;
  minHit: number;
  maxHit: number;
  attackCooldownMs: number;
  slotCount?: number;
  // monster
  monsterSpeed?: number;
  monsterAggroRange?: number;
  monsterAttackRange?: number;
  monsterAttackCooldownMs?: number;
  monsterDamage?: number;
  monsterDef?: number;
  // rooms
  roomCapacity?: number;
  // global caps
  critMax?: number;
  dodgeMax?: number;
  // throwable & traps & blink
  bombRadius?: number;
  bombDamage?: number;
  trapRadius?: number;
  trapDamage?: number;
  blinkDistance?: number;
  // skills
  skillZoneBonusPct?: number;
}

export interface FruitOther {
  critRatePct?: number;
  agiFlat?: number;
  dodgePct?: number;
  critDmg?: number;
  defFlat?: number;
  max: number;
}

export interface Fruit {
  element: Element;
  selfAtkFlat: number;
  other: FruitOther;
}

export interface Item {
  id: string;
  name: string;
  type: "invulnerable" | "speed" | "heal" | "bomb" | "trap" | "blink" | string;
  duration?: number;
  cooldown?: number;
  multiplier?: number;
  trigger?: "onPickup" | "onUse";
  healAmount?: number;
}

export interface SkillDef {
  id: string;
  name: string;
  power: number;
  cooldownMs: number;
  castMs: number;
  radius?: number;
  chainCount?: number;
  range?: number;
  kind?: "active" | "passive";
  element?: Element;
  // passive modifiers (applied on spawn)
  passive?: {
    atkFlat?: number;
    defFlat?: number;
    agiFlat?: number;
    critRatePct?: number;
    critDmg?: number;
    dodgePct?: number;
    lifestealPct?: number;
    reflectPct?: number;
    cdReductionPct?: number;
    moveSpeedPct?: number;
    maxHpFlat?: number;
    shieldFlat?: number;
  };
}

export interface CharacterDef {
  id: string;
  name: string;
  element: Element | "random";
  atk: number;
  agi: number;
  dodge: number; // 0..1
  def: number;
  crit: number; // 0..1
  critDmg: number; // >=1
}

export interface Config {
  elements: Element[];
  elementMatrix: ElementMatrix;
  characters: CharacterDef[];
  fruits: Fruit[];
  items: Item[];
  skills: SkillDef[];
  balance: Balance;
  skillWeights?: Record<string, Array<{ id: string; weight: number }>>;
  elementSkillWeights?: Record<Element, Array<{ id: string; weight: number }>>;
}

export type EntityId = string;

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Actor {
  id: string;
  element: Element;
  zoneElement?: Element;
  baseAtk: number;
  fruitAtkFlat: number;
  def: number;
  crit: number; // 0..1
  critDmg: number; // >=1
}

export interface Player extends Actor, Position, Velocity {
  hp: number;
  maxHp: number;
  agi: number;
  dodge: number;
  sameFruitStacks: Partial<Record<Element, number>>;
  invulnUntil?: number;
  speedUntil?: number;
  speedMultiplier?: number;
  bag: Record<string, number>;
  cooldowns: Record<string, number>;
  lastAttackAt?: number;
  fruitOtherGains?: {
    critRatePct?: number;
    agiFlat?: number;
    dodgePct?: number;
    critDmg?: number;
    defFlat?: number;
  };
  slots: (string | null)[];
  casting?: { skillId: string; targetId?: string; endAt: number };
  skills: string[];
  stunnedUntil?: number;
  silencedUntil?: number;
  rootedUntil?: number;
  slowUntil?: number;
  slowMul?: number;
  shieldHp?: number;
  lifestealPct?: number;
  reflectPct?: number;
  cdReductionPct?: number;
  moveSpeedBonusPct?: number;
  bleedUntil?: number;
  bleedDps?: number;
  burnUntil?: number;
  burnDps?: number;
}

export interface Defender {
  element: Element;
  zoneElement?: Element;
  def: number;
}

export interface Skill {
  id: string;
  power: number;
}

export interface GroundFruit extends Position {
  id: EntityId;
  type: "fruit";
  element: Element;
}

export interface GroundItem extends Position {
  id: EntityId;
  type: "item";
  itemId: string;
}

export interface Monster extends Position {
  id: EntityId;
  type: "monster";
  element: Element;
  hp: number;
  maxHp: number;
  def: number;
  lastAttackAt: number;
  mvx: number;
  mvy: number;
}

export interface BombEntity extends Position {
  id: EntityId;
  type: "bomb";
  ownerId: string;
  explodeAt: number;
  radius: number;
  damage: number;
}

export interface TrapEntity extends Position {
  id: EntityId;
  type: "trap";
  ownerId: string;
  radius: number;
  damage: number;
}

export type WorldEntity = GroundFruit | GroundItem | Monster | BombEntity | TrapEntity;