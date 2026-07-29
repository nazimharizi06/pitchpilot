import type { SupabaseClient } from "@supabase/supabase-js";
import { generatePlan } from "@/lib/engine/generatePlan";
import { mockProvider } from "@/lib/ai/mockProvider";
import { claudeProvider } from "@/lib/ai/claudeProvider";
import type { IntakeData, Plan } from "@/lib/types";

// Shared by the direct (adult) path in app/api/generate-plan/route.ts and the
// guardian-confirm path in app/api/guardian-consent/confirm/route.ts — the latter
// runs with no authenticated session (the parent isn't a PitchPilot user), so this
// takes whatever Supabase client it's given (user-scoped or service-role).
export async function generateAndPersistPlan(
  supabase: SupabaseClient,
  userId: string,
  intake: IntakeData
): Promise<Plan> {
  // Falls back to the deterministic mock provider when no key is configured,
  // so the app still runs with zero setup — see README.
  const provider = process.env.ANTHROPIC_API_KEY ? claudeProvider : mockProvider;
  const plan = await generatePlan(intake, provider);

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

  return plan;
}
