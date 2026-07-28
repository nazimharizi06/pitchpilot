import type { Drill } from "@/lib/types";
import type { WeightedGoal } from "@/lib/ai/provider";
import { SKILL_CATEGORY_LABELS } from "@/lib/types";

// Shared by mockProvider and claudeProvider — picking among already-valid
// candidates for variety, and restating already-decided weights as text,
// are bookkeeping rather than judgment calls, so both providers use the
// same deterministic logic instead of spending a model call on them.

export function pickDrillsByUsage(candidates: Drill[], usedCounts: Map<string, number>, count: number): Drill[] {
  const ranked = [...candidates].sort((a, b) => {
    const usageDiff = (usedCounts.get(a.id) ?? 0) - (usedCounts.get(b.id) ?? 0);
    if (usageDiff !== 0) return usageDiff;
    return candidates.indexOf(a) - candidates.indexOf(b);
  });
  return ranked.slice(0, count);
}

export function summarizeGoalWeighting(weighted: WeightedGoal[]): string {
  const parts = weighted.map((w) => `${SKILL_CATEGORY_LABELS[w.goal]} (weight ${w.weight})`);
  return `Goal priority this week, weaker self-ratings weighted higher: ${parts.join(", ")}.`;
}
