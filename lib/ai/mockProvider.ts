import type { Level } from "@/lib/types";
import { POSITION_LABELS } from "@/lib/types";
import type { AIProvider, ExplainSessionInput, WeightedGoal } from "@/lib/ai/provider";
import { pickDrillsByUsage, summarizeGoalWeighting } from "@/lib/ai/heuristics";

// Lower self-rating = higher priority weight, so weaker skills get scheduled
// more often across the week. This is the one place "AI judgment" about
// balancing multiple goals lives — swap this file out for a real Claude call
// later without touching anything that calls it.
const LEVEL_WEIGHT: Record<Level, number> = {
  beginner: 3,
  intermediate: 2,
  advanced: 1,
};

export const mockProvider: AIProvider = {
  async weightGoals(goals, selfRatings) {
    return goals
      .map((goal) => ({
        goal,
        weight: LEVEL_WEIGHT[selfRatings[goal] ?? "beginner"],
      }))
      .sort((a, b) => b.weight - a.weight);
  },

  async pickDrills(candidates, usedCounts, count) {
    return pickDrillsByUsage(candidates, usedCounts, count);
  },

  async explainSession({ themeLabel, drills, profile, blendedThemeLabels, positionEmphasis }: ExplainSessionInput) {
    const ratingNote = profile.playing_level ? ` at your ${profile.playing_level} level` : "";
    const drillNames = drills.map((d) => d.name).join(", ");
    const blendNote =
      blendedThemeLabels.length > 0
        ? ` The ${themeLabel} drill library was too small to fill the full session on its own, so it's rounded out with some ${blendedThemeLabels.join(" and ")} work too.`
        : "";
    const positionNote =
      positionEmphasis && profile.position
        ? ` This is exactly the kind of work that pays off for a ${POSITION_LABELS[profile.position]}.`
        : "";
    return (
      `This session is built around ${themeLabel}${ratingNote} because it's one of your goals ` +
      `that could use the most attention right now. Drills were chosen to fit your available space ` +
      `and equipment: ${drillNames}.${blendNote}${positionNote}`
    );
  },

  async summarizeWeighting(weighted: WeightedGoal[]) {
    return summarizeGoalWeighting(weighted);
  },
};
