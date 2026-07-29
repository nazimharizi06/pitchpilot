import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { intakeDataSchema } from "@/lib/validation";
import { generateAndPersistPlan } from "@/lib/planGeneration";
import { sendGuardianConsentEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveSubscription, meetsTier } from "@/lib/subscriptions";

const REGENERATION_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in and subscribe to Pro or Premium to generate a plan." }, { status: 401 });
  }

  const subscription = await getActiveSubscription(supabase, user.id);
  if (!meetsTier(subscription, "pro")) {
    return NextResponse.json({ error: "Upgrade to Pro or Premium to generate a training plan." }, { status: 403 });
  }

  // Pro can refresh their plan once every 7 days; Premium can refresh anytime.
  // Only applies to regenerating an existing plan — a first-time request never
  // has a `plans` row yet, so it's never blocked.
  if (subscription!.tier === "pro") {
    const { data: existingPlan } = await supabase.from("plans").select("created_at").eq("user_id", user.id).maybeSingle();
    if (existingPlan) {
      const nextAvailable = new Date(new Date(existingPlan.created_at).getTime() + REGENERATION_COOLDOWN_MS);
      if (nextAvailable.getTime() > Date.now()) {
        return NextResponse.json(
          {
            error: `Pro plans can be refreshed once every 7 days. Yours reopens on ${nextAvailable.toLocaleDateString()}. Upgrade to Premium for unlimited regeneration.`,
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
      status: "pending",
      confirmed_at: null,
    });
    await sendGuardianConsentEmail({ guardianEmail: guardianEmail!, guardianName: guardianName!, token });
    return NextResponse.json({ status: "pending_guardian_consent" }, { status: 202 });
  }

  const plan = await generateAndPersistPlan(supabase, user.id, result.data);
  return NextResponse.json(plan);
}
