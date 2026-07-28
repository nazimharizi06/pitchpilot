import { drills } from "@/lib/data/drills";
import { filterDrillsWithFallback, filterWarmupOrCooldown } from "@/lib/engine/filter";
import { assembleSession } from "@/lib/engine/schedule";
import { mockProvider } from "@/lib/ai/mockProvider";
import type { AIProvider, WeightedGoal } from "@/lib/ai/provider";
import type { Drill, Equipment, IntakeData, Level, Plan, PlanSession, Space, SkillCategory } from "@/lib/types";
import { SKILL_CATEGORY_LABELS } from "@/lib/types";

/**
 * Turns weighted goals into a rotation where weaker (higher-weight) goals
 * appear more often across the week, interleaved rather than clustered.
 * e.g. weights 3/2/1 -> [A,B,C,A,B,A]
 */
function buildWeightedRotation(weighted: WeightedGoal[]): SkillCategory[] {
  const counters = weighted.map((w) => ({ ...w, remaining: w.weight }));
  const rotation: SkillCategory[] = [];
  while (counters.some((c) => c.remaining > 0)) {
    for (const c of counters) {
      if (c.remaining > 0) {
        rotation.push(c.goal);
        c.remaining -= 1;
      }
    }
  }
  return rotation;
}

function candidatesForGoal(goal: SkillCategory, level: Level, equipment: Equipment[], space: Space) {
  // Weak-foot sessions blend the standalone Weak Foot category with any
  // drill elsewhere tagged with a weak_foot_variant, per the doc's decision.
  const pool: Drill[] =
    goal === "weak_foot"
      ? drills.filter((d) => d.session_type === "main" && (d.categories.includes("weak_foot") || Boolean(d.weak_foot_variant)))
      : drills.filter((d) => d.session_type === "main" && d.categories.includes(goal));

  return filterDrillsWithFallback(pool, { level, equipment, space });
}

function candidateBelongsToGoal(drill: Drill, goal: SkillCategory): boolean {
  if (goal === "weak_foot") return drill.categories.includes("weak_foot") || Boolean(drill.weak_foot_variant);
  return drill.categories.includes(goal);
}

export async function generatePlan(intake: IntakeData, aiProvider: AIProvider = mockProvider): Promise<Plan> {
  const { profile, goalsAndAssessment } = intake;
  const { goals, self_ratings, days_per_week, space_available, equipment_available } = goalsAndAssessment;

  const weighted = await aiProvider.weightGoals(goals, self_ratings);
  const rotation = buildWeightedRotation(weighted);
  // Goal fill priority for topping up a session once the day's theme runs
  // out of matching drills — weightGoals' own ordering (weaker goals first).
  const priorityOrder = weighted.map((w) => w.goal);

  const warmUpPool = filterWarmupOrCooldown(drills, "warm_up", equipment_available, space_available);
  const coolDownPool = filterWarmupOrCooldown(drills, "cool_down", equipment_available, space_available);

  const usedCounts = new Map<string, number>();
  const sessions: PlanSession[] = [];

  for (let day = 0; day < days_per_week; day++) {
    const theme = rotation[day % rotation.length];
    const themeLevel = self_ratings[theme] ?? profile.playing_level;

    // Small drill library per category means a single goal often can't fill
    // the full 45-60 min budget on its own. Rank the theme's own candidates
    // first, then fall back to the user's other selected goals (in the same
    // weighted priority order) to round the session out, per the doc's "how
    // to mix skill work within a session" being left to AI judgment.
    const fillOrder = [theme, ...priorityOrder.filter((g) => g !== theme)];
    const rankedCandidates: Drill[] = [];
    const seenDrillIds = new Set<string>();

    for (const goal of fillOrder) {
      const goalLevel = self_ratings[goal] ?? profile.playing_level;
      const { drills: pool } = candidatesForGoal(goal, goalLevel, equipment_available, space_available);
      const ranked = await aiProvider.pickDrills(pool, usedCounts, pool.length);
      for (const d of ranked) {
        if (seenDrillIds.has(d.id)) continue;
        seenDrillIds.add(d.id);
        rankedCandidates.push(d);
      }
    }

    const assembled = assembleSession(day, warmUpPool, rankedCandidates, coolDownPool);
    const sessionDrills = [assembled.warmUp, ...assembled.main, assembled.coolDown];

    sessionDrills.forEach((d) => {
      usedCounts.set(d.id, (usedCounts.get(d.id) ?? 0) + 1);
    });

    const blendedThemeLabels = fillOrder
      .filter((g) => g !== theme && assembled.main.some((d) => candidateBelongsToGoal(d, g)))
      .map((g) => SKILL_CATEGORY_LABELS[g]);

    const explanation = await aiProvider.explainSession({
      theme,
      themeLabel: SKILL_CATEGORY_LABELS[theme],
      level: themeLevel,
      drills: sessionDrills,
      profile,
      blendedThemeLabels,
    });

    sessions.push({
      day: day + 1,
      theme: SKILL_CATEGORY_LABELS[theme],
      drills: sessionDrills.map((d) => ({ drillId: d.id, reps_duration: d.reps_duration })),
      target_duration_minutes: assembled.totalMinutes,
      explanation,
    });
  }

  return {
    sessions,
    ai_weighting_notes: await aiProvider.summarizeWeighting(weighted),
    generated_at: new Date().toISOString(),
  };
}
