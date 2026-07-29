import type { Drill, GoalsAndAssessment, Level, SkillCategory, UserProfile } from "@/lib/types";

export interface WeightedGoal {
  goal: SkillCategory;
  weight: number;
}

export interface ExplainSessionInput {
  theme: SkillCategory;
  themeLabel: string;
  level: Level;
  drills: Drill[];
  profile: UserProfile;
  /** Other selected goals whose drills were pulled in to fill out the session once the theme's own pool ran dry. */
  blendedThemeLabels: string[];
  /** True when today's theme is one of profile.position's emphasized categories (lib/positionMeta.ts) — lets the explanation mention position naturally instead of forcing it into every session. */
  positionEmphasis: boolean;
}

/**
 * The AI-judgment layer from the plan doc: balancing goals, picking specific
 * drills among matches, and explaining sessions to the user. `mockProvider`
 * implements this deterministically with no API key; `claudeProvider` (stub)
 * is where a real Claude API call would plug in behind this exact interface.
 */
export interface AIProvider {
  weightGoals(goals: SkillCategory[], selfRatings: GoalsAndAssessment["self_ratings"]): Promise<WeightedGoal[]>;
  pickDrills(candidates: Drill[], usedCounts: Map<string, number>, count: number): Promise<Drill[]>;
  explainSession(input: ExplainSessionInput): Promise<string>;
  summarizeWeighting(weighted: WeightedGoal[]): Promise<string>;
}
