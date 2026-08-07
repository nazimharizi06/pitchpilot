import type { SupabaseClient } from "@supabase/supabase-js";
import { generatePlan } from "@/lib/engine/generatePlan";
import { mockProvider } from "@/lib/ai/mockProvider";
import { claudeProvider } from "@/lib/ai/claudeProvider";
import type { IntakeData, Plan } from "@/lib/types";

// The one place that decides which AI provider generation uses — falls back
// to the deterministic mock when no key is configured, so the app still runs
// with zero setup (see README).
export function getAiProvider() {
  return process.env.ANTHROPIC_API_KEY ? claudeProvider : mockProvider;
}

// Writes an already-generated plan for a real, authenticated user. Split out
// from generateAndPersistPlan so a plan generated anonymously
// (app/api/generate-plan-anonymous/route.ts) can be attached to an account
// after login (app/api/claim-pending-plan/route.ts) without ever calling
// generatePlan() a second time.
export async function persistPlan(supabase: SupabaseClient, userId: string, intake: IntakeData, plan: Plan): Promise<void> {
  await supabase.from("plans").upsert({
    user_id: userId,
    intake,
    plan,
    created_at: new Date().toISOString(),
  });
  await supabase.from("session_progress").delete().eq("user_id", userId);
  await supabase.from("session_progress").insert(
    plan.sessions.map((session) => ({
      user_id: userId,
      day: session.day,
      completed_at: null,
      completed_drill_ids: [],
    }))
  );
}

// Shared by the direct (adult) path in app/api/generate-plan/route.ts and the
// guardian-confirm path in app/api/guardian-consent/confirm/route.ts — the latter
// runs with no authenticated session (the parent isn't a PitchPilot user), so this
// takes whatever Supabase client it's given (user-scoped or service-role).
export async function generateAndPersistPlan(
  supabase: SupabaseClient,
  userId: string,
  intake: IntakeData
): Promise<Plan> {
  const plan = await generatePlan(intake, getAiProvider());
  await persistPlan(supabase, userId, intake, plan);
  return plan;
}
