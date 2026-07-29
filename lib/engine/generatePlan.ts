import { drills } from "@/lib/data/drills";
import { filterDrillsWithFallback, filterWarmupOrCooldown } from "@/lib/engine/filter";
import { assembleSession } from "@/lib/engine/schedule";
import { mockProvider } from "@/lib/ai/mockProvider";
import { POSITION_EMPHASIS } from "@/lib/positionMeta";
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

// Runs explainSession calls in small parallel batches rather than one giant
// Promise.all — a 3-week plan can be up to 21 days, and firing all 21 Claude
// calls at once risks tripping a lower-tier account's concurrent-request/RPM
// limit. Batches of 5 still cut a 21-call sequential chain down to ~5 rounds.
async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export async function generatePlan(intake: IntakeData, aiProvider: AIProvider = mockProvider): Promise<Plan> {
  const { profile, goalsAndAssessment } = intake;
  const { goals, self_ratings, days_per_week, space_available, equipment_available } = goalsAndAssessment;

  const weighted = await aiProvider.weightGoals(goals, self_ratings);

  // Position-aware weighting — a coach naturally leans on the categories that
  // matter most for a player's position, without overriding what the player
  // actually asked to work on. This only ever nudges weight *up* for a goal the
  // player already selected — it never adds a goal they didn't pick, and never
  // lowers one either. Goalkeeper is the one exception that goes all the way to
  // the max weight: goalkeeping is exclusive enough (either you're training it
  // or you're not) that a modest nudge doesn't make sense the way it does for
  // outfield categories, which naturally overlap across positions.
  const emphasized = (profile.position ? POSITION_EMPHASIS[profile.position] : undefined) ?? [];
  if (emphasized.length > 0) {
    const floor = profile.position === "goalkeeper" ? 3 : 2;
    for (const goal of emphasized) {
      const entry = weighted.find((w) => w.goal === goal);
      if (entry) entry.weight = Math.max(entry.weight, floor);
    }
    weighted.sort((a, b) => b.weight - a.weight);
  }

  const rotation = buildWeightedRotation(weighted);
  // Goal fill priority for topping up a session once the day's theme runs
  // out of matching drills — weightGoals' own ordering (weaker goals first).
  const priorityOrder = weighted.map((w) => w.goal);

  const warmUpPool = filterWarmupOrCooldown(drills, "warm_up", equipment_available, space_available);
  const coolDownPool = filterWarmupOrCooldown(drills, "cool_down", equipment_available, space_available);

  const usedCounts = new Map<string, number>();

  // 3 weeks of sessions per intake, so a subscriber only needs to retake intake
  // once they've actually finished a full program — see app/api/generate-plan/route.ts
  // for the Pro-tier completion gate this enables.
  const totalDays = days_per_week * 3;

  // Drill selection (below) has to stay sequential — each day's picks depend on
  // usedCounts from every day before it, to avoid repeating the same drills too
  // often across a 3-week program. explainSession does NOT have that dependency
  // (it only describes a day's already-chosen drills), so it's deliberately
  // pulled out of this loop and fired in parallel afterward — with claudeProvider,
  // this was previously one real Claude API call per day, awaited one at a time,
  // which made a 3-week plan (9-21 days) take 9-21x a single call's latency in a
  // row — long enough to exceed Vercel's default function timeout on some plans.
  interface DayDraft {
    day: number;
    theme: SkillCategory;
    themeLevel: Level;
    sessionDrills: Drill[];
    blendedThemeLabels: string[];
    totalMinutes: number;
  }

  const drafts: DayDraft[] = [];

  for (let day = 0; day < totalDays; day++) {
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

    drafts.push({ day, theme, themeLevel, sessionDrills, blendedThemeLabels, totalMinutes: assembled.totalMinutes });
  }

  const explanations = await mapWithConcurrency(drafts, 5, (d) =>
    aiProvider.explainSession({
      theme: d.theme,
      themeLabel: SKILL_CATEGORY_LABELS[d.theme],
      level: d.themeLevel,
      drills: d.sessionDrills,
      profile,
      blendedThemeLabels: d.blendedThemeLabels,
      positionEmphasis: emphasized.includes(d.theme),
    })
  );

  const sessions: PlanSession[] = drafts.map((d, i) => ({
    day: d.day + 1,
    week: Math.floor(d.day / days_per_week) + 1,
    theme: SKILL_CATEGORY_LABELS[d.theme],
    drills: d.sessionDrills.map((drill) => ({ drillId: drill.id, reps_duration: drill.reps_duration })),
    target_duration_minutes: d.totalMinutes,
    explanation: explanations[i],
    source: "ai",
  }));

  return {
    sessions,
    ai_weighting_notes: await aiProvider.summarizeWeighting(weighted),
    generated_at: new Date().toISOString(),
  };
}
