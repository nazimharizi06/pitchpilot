import type { SupabaseClient } from "@supabase/supabase-js";
import type { IntakeData, Plan, PlanSession } from "@/lib/types";

export interface SessionProgressRow {
  day: number;
  completed_at: string | null;
  completed_drill_ids: string[];
}

export interface PlanState {
  // Null for a purely self-built plan (Base tier, which skips /intake entirely) —
  // see PlanSession["source"] in lib/types.ts.
  intake: IntakeData | null;
  plan: Plan;
  progress: SessionProgressRow[];
}

// Reads the signed-in user's current plan + per-day progress. Returns null if
// they haven't generated (or built) a plan yet.
export async function loadPlanState(supabase: SupabaseClient, userId: string): Promise<PlanState | null> {
  const { data: planRow } = await supabase.from("plans").select("intake, plan").eq("user_id", userId).maybeSingle();
  if (!planRow) return null;

  const { data: progressRows } = await supabase
    .from("session_progress")
    .select("day, completed_at, completed_drill_ids")
    .eq("user_id", userId)
    .order("day", { ascending: true });

  return {
    intake: planRow.intake as IntakeData | null,
    plan: planRow.plan as Plan,
    progress: (progressRows ?? []) as SessionProgressRow[],
  };
}

// Adds (or replaces, if that day hasn't been completed yet) one manually-built session —
// used by the workout builder (components/dashboard/WorkoutBuilder.tsx), available to every
// tier. Creates the `plans` row from scratch if this is the user's first-ever session
// (Base tier never runs /intake, so it never gets an AI-generated plan first).
export async function addOrReplaceCustomSession(
  supabase: SupabaseClient,
  userId: string,
  currentPlan: PlanState | null,
  day: number,
  session: PlanSession
): Promise<{ error?: string }> {
  const existingProgress = currentPlan?.progress.find((p) => p.day === day);
  if (existingProgress?.completed_at) {
    return { error: "That day is already completed and can't be rebuilt." };
  }

  const sessions = (currentPlan?.plan.sessions ?? []).filter((s) => s.day !== day);
  sessions.push(session);
  sessions.sort((a, b) => a.day - b.day);

  const { error: planError } = await supabase.from("plans").upsert({
    user_id: userId,
    intake: currentPlan?.intake ?? null,
    plan: {
      sessions,
      ai_weighting_notes: currentPlan?.plan.ai_weighting_notes ?? "",
      generated_at: currentPlan?.plan.generated_at ?? new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
  });
  if (planError) return { error: "Couldn't save your session. Please try again." };

  await supabase.from("session_progress").upsert({
    user_id: userId,
    day,
    completed_at: null,
    completed_drill_ids: [],
  });

  return {};
}

export async function toggleDrillComplete(
  supabase: SupabaseClient,
  userId: string,
  day: number,
  drillId: string,
  progress: SessionProgressRow[]
): Promise<string[]> {
  const row = progress.find((p) => p.day === day);
  const current = row?.completed_drill_ids ?? [];
  const next = current.includes(drillId) ? current.filter((id) => id !== drillId) : [...current, drillId];

  await supabase.from("session_progress").update({ completed_drill_ids: next }).eq("user_id", userId).eq("day", day);

  return next;
}

export async function markSessionComplete(supabase: SupabaseClient, userId: string, day: number): Promise<void> {
  await supabase
    .from("session_progress")
    .update({ completed_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("day", day);
}

export function isDayUnlocked(day: number, progress: SessionProgressRow[]): boolean {
  if (day <= 1) return true;
  const prev = progress.find((p) => p.day === day - 1);
  return Boolean(prev?.completed_at);
}

export interface PlanStats {
  streak: number;
  sessionsCompleted: number;
  completionPct: number;
  totalMinutes: number;
  drillsCompleted: number;
}

export function computeStats(sessions: PlanSession[], progress: SessionProgressRow[]): PlanStats {
  const byDay = new Map(progress.map((p) => [p.day, p]));

  let sessionsCompleted = 0;
  let totalMinutes = 0;
  let drillsCompleted = 0;
  const completedDates: string[] = [];

  for (const session of sessions) {
    const row = byDay.get(session.day);
    drillsCompleted += row?.completed_drill_ids.length ?? 0;
    if (row?.completed_at) {
      sessionsCompleted += 1;
      totalMinutes += session.target_duration_minutes;
      completedDates.push(row.completed_at.slice(0, 10)); // UTC calendar date, YYYY-MM-DD
    }
  }

  // Consecutive-day streak: walk back from the most recent completed date,
  // stopping at the first gap.
  const uniqueDatesDesc = Array.from(new Set(completedDates)).sort().reverse();
  let streak = 0;
  let cursor: Date | null = null;
  for (const dateStr of uniqueDatesDesc) {
    const date = new Date(`${dateStr}T00:00:00Z`);
    if (cursor === null) {
      streak = 1;
      cursor = date;
      continue;
    }
    const expectedPrev = new Date(cursor);
    expectedPrev.setUTCDate(expectedPrev.getUTCDate() - 1);
    if (date.getTime() === expectedPrev.getTime()) {
      streak += 1;
      cursor = date;
    } else {
      break;
    }
  }

  return {
    streak,
    sessionsCompleted,
    completionPct: sessions.length > 0 ? Math.round((sessionsCompleted / sessions.length) * 100) : 0,
    totalMinutes,
    drillsCompleted,
  };
}
