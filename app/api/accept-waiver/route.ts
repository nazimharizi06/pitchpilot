import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendGuardianConsentEmail } from "@/lib/email";

// Base tier skips /intake entirely (see components/dashboard/WorkoutBuilder.tsx), so it
// never collects account_type/age — this route is where its waiver acceptance (and, for a
// minor, the same guardian-email-confirmation gate the /intake path uses) actually happens.
const bodySchema = z.discriminatedUnion("isAdult", [
  z.object({ isAdult: z.literal(true) }),
  z.object({
    isAdult: z.literal(false),
    guardianName: z.string().trim().min(1, "Guardian name is required"),
    guardianEmail: z.string().trim().email("Enter a valid guardian email"),
  }),
]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = bodySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (result.data.isAdult) {
    await admin
      .from("subscriptions")
      .update({ waiver_accepted: true, waiver_accepted_at: new Date().toISOString() })
      .eq("user_id", user.id);
    return NextResponse.json({ status: "accepted" });
  }

  const { guardianName, guardianEmail } = result.data;
  const token = randomUUID();
  await admin.from("guardian_verifications").upsert({
    user_id: user.id,
    token,
    guardian_name: guardianName,
    guardian_email: guardianEmail,
    intake: null,
    purpose: "waiver_only",
    status: "pending",
    confirmed_at: null,
  });
  await sendGuardianConsentEmail({ guardianEmail, guardianName, token, purpose: "waiver_only" });

  return NextResponse.json({ status: "pending_guardian_consent" }, { status: 202 });
}
