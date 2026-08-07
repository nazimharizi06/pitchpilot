import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { intakeDataSchema } from "@/lib/validation";
import { generateAndPersistPlan } from "@/lib/planGeneration";
import { sendGuardianConsentEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveSubscription, meetsTier } from "@/lib/subscriptions";

// A 3-week plan can make up to ~21 Claude calls (batched, see generatePlan.ts),
// which can run past Vercel's default timeout. This raises the ceiling on plans
// that support configuring it — Hobby is hard-capped at 10s regardless, so this
// alone isn't sufficient there; the batching in generatePlan.ts is what actually
// keeps wall-clock time down on any plan.
export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to build your training plan." }, { status: 401 });
  }

  // A first plan is free for any signed-in account — this is the free preview
  // shown before payment. `plans.user_id` is a primary key (one row per user),
  // so "does a row already exist" is exactly "has this account already used its
  // free generation" — no separate flag needed. Regenerating an existing plan
  // still requires an active Pro/Premium subscription, exactly as before this
  // change.
  const { data: existingPlan } = await supabase.from("plans").select("user_id").eq("user_id", user.id).maybeSingle();

  if (existingPlan) {
    const subscription = await getActiveSubscription(supabase, user.id);
    if (!meetsTier(subscription, "pro")) {
      return NextResponse.json({ error: "Upgrade to Pro or Premium to build a new training plan." }, { status: 403 });
    }

    // Pro can only start a new 3-week program once their current one is fully
    // completed; Premium can regenerate anytime, even mid-program.
    if (subscription!.tier === "pro") {
      const { data: progressRows } = await supabase
        .from("session_progress")
        .select("completed_at")
        .eq("user_id", user.id);
      const stillInProgress = (progressRows ?? []).some((row) => !row.completed_at);
      if (stillInProgress) {
        return NextResponse.json(
          {
            error:
              "Complete your current 3-week program before starting a new one. Upgrade to Premium to change plans anytime.",
          },
          { status: 429 }
        );
      }
    }
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = intakeDataSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message ?? "Invalid intake data" }, { status: 400 });
  }

  const { profile, guardianName, guardianEmail } = result.data;
  const isMinorPlayer = profile.account_type === "player" && profile.age < 18;

  if (isMinorPlayer) {
    // A minor can't be the one who legally accepts the liability waiver — hold off on
    // generating anything until their parent/guardian clicks the confirmation email.
    // guardianName/guardianEmail are required by intakeDataSchema in this case.
    const token = randomUUID();
    const admin = createAdminClient();
    await admin.from("guardian_verifications").upsert({
      user_id: user.id,
      token,
      guardian_name: guardianName!,
      guardian_email: guardianEmail!,
      intake: result.data,
      purpose: "plan",
      status: "pending",
      confirmed_at: null,
    });
    await sendGuardianConsentEmail({ guardianEmail: guardianEmail!, guardianName: guardianName!, token, purpose: "plan" });
    return NextResponse.json({ status: "pending_guardian_consent" }, { status: 202 });
  }

  const plan = await generateAndPersistPlan(supabase, user.id, result.data);
  return NextResponse.json(plan);
}
