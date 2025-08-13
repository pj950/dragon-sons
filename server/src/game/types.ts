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
  type: "invulnerable" | "speed" | string;
  duration?: number;
  cooldown?: number;
  multiplier?: number;
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
  balance: Balance;
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
  sameFruitStacks: Partial<Record<Element, number>>;
  invulnUntil?: number;
  speedUntil?: number;
  speedMultiplier?: number;
}

export interface Skill {
  id: string;
  power: number; // skill damage coefficient
}

export interface GroundFruit extends Position {
  id: EntityId;
  type: "fruit";
  element: Element;
}

export interface GroundItem extends Position {
  id: EntityId;
  type: "item";
  itemId: string; // matches Config.items.id
}

export interface Monster extends Position {
  id: EntityId;
  type: "monster";
  element: Element;
  hp: number;
  maxHp: number;
}

export type WorldEntity = GroundFruit | GroundItem | Monster;