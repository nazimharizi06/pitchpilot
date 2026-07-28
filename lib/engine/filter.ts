import type { Drill, Equipment, Level, Space } from "@/lib/types";
import { LEVELS } from "@/lib/types";

// Space isn't strictly ordered in real life, but for MVP filtering we rank by
// typical size so a user with more room can also run smaller-space drills.
const SPACE_RANK: Record<Space, number> = {
  indoor: 0,
  yard: 1,
  driveway: 2,
  full_field: 3,
};

export function spaceSatisfies(userSpace: Space, drillSpace: Space): boolean {
  return SPACE_RANK[userSpace] >= SPACE_RANK[drillSpace];
}

export function equipmentSatisfies(userEquipment: Equipment[], drillEquipment: Equipment[]): boolean {
  const owned = new Set(userEquipment);
  return drillEquipment.every((item) => item === "none" || owned.has(item));
}

function adjacentLevels(level: Level): Level[] {
  const idx = LEVELS.indexOf(level);
  return [LEVELS[idx - 1], LEVELS[idx + 1]].filter((l): l is Level => Boolean(l));
}

interface FilterConstraints {
  level: Level;
  equipment: Equipment[];
  space: Space;
}

export interface FallbackResult {
  drills: Drill[];
  fallbackApplied: "none" | "adjacent_level" | "relaxed_equipment" | "relaxed_space";
}

/**
 * Rule-based hard-constraint filter with the fallback chain described in the
 * plan doc: when a level+equipment+space+goal combo matches zero drills,
 * widen level first, then relax equipment, then (last resort, not in the
 * original doc but needed so a plan is never literally empty) relax space.
 */
export function filterDrillsWithFallback(pool: Drill[], constraints: FilterConstraints): FallbackResult {
  const { level, equipment, space } = constraints;

  const exact = pool.filter(
    (d) => d.level === level && equipmentSatisfies(equipment, d.equipment) && spaceSatisfies(space, d.space)
  );
  if (exact.length > 0) return { drills: exact, fallbackApplied: "none" };

  const widenedLevels = new Set([level, ...adjacentLevels(level)]);
  const adjacentLevelMatch = pool.filter(
    (d) => widenedLevels.has(d.level) && equipmentSatisfies(equipment, d.equipment) && spaceSatisfies(space, d.space)
  );
  if (adjacentLevelMatch.length > 0) return { drills: adjacentLevelMatch, fallbackApplied: "adjacent_level" };

  const relaxedEquipment = pool.filter((d) => widenedLevels.has(d.level) && spaceSatisfies(space, d.space));
  if (relaxedEquipment.length > 0) return { drills: relaxedEquipment, fallbackApplied: "relaxed_equipment" };

  const relaxedSpace = pool.filter((d) => widenedLevels.has(d.level));
  return { drills: relaxedSpace, fallbackApplied: "relaxed_space" };
}

export function filterWarmupOrCooldown(
  pool: Drill[],
  sessionType: "warm_up" | "cool_down",
  equipment: Equipment[],
  space: Space
): Drill[] {
  // Warm-up/cool-down are generic and NOT goal- or level-matched per the doc —
  // only equipment/space have to fit.
  return pool.filter(
    (d) => d.session_type === sessionType && equipmentSatisfies(equipment, d.equipment) && spaceSatisfies(space, d.space)
  );
}
