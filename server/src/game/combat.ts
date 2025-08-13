import { Balance, Player, Skill, ElementMatrix } from "./types";
import { elementMultiplier, isCounter } from "./elements";

export interface Ctx {
  elementMatrix: ElementMatrix;
  balance: Balance;
}

export function computeDamage(ctx: Ctx, atk: Player, def: Player, skill: Skill): number {
  if (!rollHit(atk, def, ctx)) return 0;

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
  }
  if (other.critDmg) {
    player.critDmg += other.critDmg;
  }
  if (other.defFlat) {
    player.def += other.defFlat;
  }
  // agiFlat、dodgePct 等属性在此处可按需要扩展到 Player 类型
}

function rollHit(_atk: Player, _def: Player, _ctx: Ctx): boolean {
  // 简化：基础命中 90%
  return roll(0.9);
}

function roll(prob: number): boolean {
  return Math.random() < prob;
}