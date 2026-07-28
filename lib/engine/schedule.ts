import type { Drill } from "@/lib/types";

export const SESSION_MIN_MINUTES = 45;
export const SESSION_MAX_MINUTES = 60;

export interface AssembledSession {
  warmUp: Drill;
  main: Drill[];
  coolDown: Drill;
  totalMinutes: number;
}

/**
 * Fits warm-up + as many main drills as the 45-60 min budget allows + cool-down.
 * Drill count is deliberately not fixed — however many fit the remaining
 * budget, per the doc's plan-generation rules. `mainCandidatesRanked` should
 * already be in the AI provider's preference order; this just budgets them.
 */
export function assembleSession(
  day: number,
  warmUpCandidates: Drill[],
  mainCandidatesRanked: Drill[],
  coolDownCandidates: Drill[],
  maxMinutes: number = SESSION_MAX_MINUTES
): AssembledSession {
  if (warmUpCandidates.length === 0 || coolDownCandidates.length === 0) {
    throw new Error("No warm-up/cool-down drills available for the given equipment and space.");
  }

  const warmUp = warmUpCandidates[day % warmUpCandidates.length];
  const coolDown = coolDownCandidates[day % coolDownCandidates.length];

  let total = warmUp.estimated_minutes + coolDown.estimated_minutes;
  const main: Drill[] = [];

  for (const drill of mainCandidatesRanked) {
    if (total + drill.estimated_minutes > maxMinutes) continue;
    main.push(drill);
    total += drill.estimated_minutes;
  }

  return { warmUp, main, coolDown, totalMinutes: total };
}
