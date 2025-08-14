import { Balance, Player, Skill, ElementMatrix, Element, Fruit, FruitOther } from "./types";
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

  const critRate = Math.min(ctx.balance.critMax ?? 1, atk.crit);
  const defDodge = Math.min(ctx.balance.dodgeMax ?? 1, def.dodge ?? 0);
  const critMul = roll(critRate) ? atk.critDmg : 1;
  const defMit = 1 - def.def / (def.def + ctx.balance.kDef);

  const damage = effectiveAtk * elementMul * critMul * defMit * zoneDefMul;
  return Math.max(1, Math.floor(damage));
}

export function applyFruit(player: Player, fruit: Fruit, bal: Balance) {
  const same = fruit.element === player.element;
  if (same) {
    const stacks = player.sameFruitStacks[fruit.element] ?? 0;
    const diminish = stacks >= bal.sameFruitDiminishStart ? bal.sameFruitDiminishRate : 1;
    const gain = Math.round(fruit.selfAtkFlat * diminish);
    const capRemain = bal.sameFruitAtkCap - player.fruitAtkFlat;
    player.fruitAtkFlat += Math.max(0, Math.min(gain, capRemain));
    player.sameFruitStacks[fruit.element] = stacks + 1;
  } else if (fruit.other) {
    grantSecondary(player, fruit.other, bal);
  }
}

function grantSecondary(player: Player, other: FruitOther, bal: Balance) {
  const gains = player.fruitOtherGains ?? {};
  const clamp = (value: number, max: number, current: number) => Math.max(0, Math.min(value, Math.max(0, max - current)));

  if (other.critRatePct) {
    const add = clamp(other.critRatePct, Math.min(other.max, bal.critMax ?? other.max), gains.critRatePct ?? 0);
    player.crit = Math.min(bal.critMax ?? 1, player.crit + add);
    gains.critRatePct = (gains.critRatePct ?? 0) + add;
  }
  if (other.critDmg) {
    const add = clamp(other.critDmg, other.max, gains.critDmg ?? 0);
    player.critDmg += add;
    gains.critDmg = (gains.critDmg ?? 0) + add;
  }
  if (other.defFlat) {
    const add = clamp(other.defFlat, other.max, gains.defFlat ?? 0);
    player.def += add;
    gains.defFlat = (gains.defFlat ?? 0) + add;
  }
  if (other.agiFlat) {
    const add = clamp(other.agiFlat, other.max, gains.agiFlat ?? 0);
    player.agi += add;
    gains.agiFlat = (gains.agiFlat ?? 0) + add;
  }
  if (other.dodgePct) {
    const add = clamp(other.dodgePct, Math.min(other.max, bal.dodgeMax ?? other.max), gains.dodgePct ?? 0);
    player.dodge = Math.min(bal.dodgeMax ?? 1, player.dodge + add);
    gains.dodgePct = (gains.dodgePct ?? 0) + add;
  }

  player.fruitOtherGains = gains;
}

function rollHit(ctx: Ctx, atk: Player, def: Player): boolean {
  const base = ctx.balance.baseHit;
  const agiDiff = (atk.agi - (def.agi ?? 100));
  let hit = base + agiDiff * ctx.balance.agiHitCoef - Math.min(ctx.balance.dodgeMax ?? 1, def.dodge ?? 0);
  hit = Math.max(ctx.balance.minHit, Math.min(ctx.balance.maxHit, hit));
  return roll(hit);
}

function roll(prob: number): boolean {
  return Math.random() < prob;
}