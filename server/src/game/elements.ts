import { Element, ElementMatrix } from "./types";

export const ELEMENTS: Element[] = ["metal", "wood", "water", "fire", "earth"];

export const DEFAULT_ELEMENT_MATRIX: ElementMatrix = {
  metal: { wood: 1.25, fire: 0.85, water: 1.1, earth: 0.95 },
  wood: { earth: 1.25, metal: 0.85, fire: 1.1, water: 0.95 },
  water: { fire: 1.25, earth: 0.85, wood: 1.1, metal: 0.95 },
  fire: { metal: 1.25, water: 0.85, earth: 1.1, wood: 0.95 },
  earth: { water: 1.25, wood: 0.85, metal: 1.1, fire: 0.95 },
};

export function elementMultiplier(
  attacker: Element,
  defender: Element,
  matrix: ElementMatrix = DEFAULT_ELEMENT_MATRIX
): number {
  return matrix[attacker]?.[defender] ?? 1;
}

export function isCounter(attacker: Element, defender: Element, matrix?: ElementMatrix): boolean {
  return elementMultiplier(attacker, defender, matrix) > 1;
}