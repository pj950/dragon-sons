import { Balance, Player, Skill, ElementMatrix, Element } from "./types";
import { elementMultiplier, isCounter } from "./elements";

export interface Ctx {
  elementMatrix: ElementMatrix;
  balance: Balance;
}

export function computeDamage(ctx: Ctx, atk: Player, def: Player, skill: Skill): number {
  if (!rollHit(ctx, atk, def)) return 0;

  const zoneAtkMul = atk.zoneElement === atk.element ? 1 + ctx.balance.zoneBuffAtkPct : 1;
  const zoneDefMul = def.zoneElement && isCounter(def.zoneElement, def.element, ctx.elementMatrix)
    ? 1 - ctx.balance.zoneDebuffDefPct
    : 1;

  const effectiveAtk = (atk.baseAtk + atk.fruitAtkFlat) * zoneAtkMul * skill.power;
  const elementMul = elementMultiplier(atk.element, def.element, ctx.elementMatrix);

  const critMul = roll(atk.crit) ? atk.critDmg : 1;
  const defMit = 1 - def.def / (def.def + ctx.balance.kDef);

  const damage = effectiveAtk * elementMul * critMul * defMit * zoneDefMul;
  return Math.max(1, Math.floor(damage));
}

export function applyFruit(player: Player, fruit: { element: Player["element"]; selfAtkFlat: number; other?: any }, bal: Balance) {
  const same = fruit.element === player.element;
  if (same) {
    const stacks = player.sameFruitStacks[fruit.element] ?? 0;
    const diminish = stacks >= bal.sameFruitDiminishStart ? bal.sameFruitDiminishRate : 1;
    const gain = Math.round(fruit.selfAtkFlat * diminish);
    const capRemain = bal.sameFruitAtkCap - player.fruitAtkFlat;
    player.fruitAtkFlat += Math.max(0, Math.min(gain, capRemain));
    player.sameFruitStacks[fruit.element] = stacks + 1;
  } else if (fruit.other) {
    grantSecondary(player, fruit.other);
  }
}

function grantSecondary(player: Player, other: any) {
  if (other.critRatePct) {
    player.crit = Math.min(1, player.crit + other.critRatePct);
    player.fruitOtherGains = { ...(player.fruitOtherGains ?? {}), critRatePct: (player.fruitOtherGains?.critRatePct ?? 0) + other.critRatePct };
  }
  if (other.critDmg) {
    player.critDmg += other.critDmg;
    player.fruitOtherGains = { ...(player.fruitOtherGains ?? {}), critDmg: (player.fruitOtherGains?.critDmg ?? 0) + other.critDmg };
  }
  if (other.defFlat) {
    player.def += other.defFlat;
    player.fruitOtherGains = { ...(player.fruitOtherGains ?? {}), defFlat: (player.fruitOtherGains?.defFlat ?? 0) + other.defFlat };
  }
  if (other.agiFlat) {
    player.agi += other.agiFlat;
    player.fruitOtherGains = { ...(player.fruitOtherGains ?? {}), agiFlat: (player.fruitOtherGains?.agiFlat ?? 0) + other.agiFlat };
  }
  if (other.dodgePct) {
    player.dodge = Math.min(1, player.dodge + other.dodgePct);
    player.fruitOtherGains = { ...(player.fruitOtherGains ?? {}), dodgePct: (player.fruitOtherGains?.dodgePct ?? 0) + other.dodgePct };
  }
}

function rollHit(ctx: Ctx, atk: Player, def: Player): boolean {
  const base = ctx.balance.baseHit;
  const agiDiff = (atk.agi - (def.agi ?? 100));
  let hit = base + agiDiff * ctx.balance.agiHitCoef - (def.dodge ?? 0);
  hit = Math.max(ctx.balance.minHit, Math.min(ctx.balance.maxHit, hit));
  return roll(hit);
}

function roll(prob: number): boolean {
  return Math.random() < prob;
}