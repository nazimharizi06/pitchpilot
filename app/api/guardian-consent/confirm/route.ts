import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAndPersistPlan } from "@/lib/planGeneration";
import type { IntakeData } from "@/lib/types";

// Public, no-auth route — the parent clicking this link is very likely not signed
// into a PitchPilot session (may not even have an account), possibly on a
// different device than the player. See lib/planGeneration.ts for why this uses
// the service-role client instead of a user-scoped one.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");
  const admin = createAdminClient();

  if (!token) {
    return NextResponse.redirect(`${origin}/guardian-consent?status=invalid`);
  }

  const { data: row } = await admin
    .from("guardian_verifications")
    .select("user_id, status, intake")
    .eq("token", token)
    .maybeSingle();

  if (!row) {
    return NextResponse.redirect(`${origin}/guardian-consent?status=invalid`);
  }

  if (row.status === "confirmed") {
    return NextResponse.redirect(`${origin}/guardian-consent?status=already_confirmed`);
  }

  await admin
    .from("guardian_verifications")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("token", token);

  await generateAndPersistPlan(admin, row.user_id, row.intake as IntakeData);

  return NextResponse.redirect(`${origin}/guardian-consent?status=confirmed`);
}
