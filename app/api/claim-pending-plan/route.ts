import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { persistPlan } from "@/lib/planGeneration";
import type { IntakeData, Plan } from "@/lib/types";

const PENDING_PLAN_COOKIE = "pp_pending_token";

// Attaches an already-generated plan (from app/api/generate-plan-anonymous/route.ts)
// to the now-authenticated user. Never calls generatePlan() — only persists
// what was already built, exactly once, then deletes the pending row so the
// same token can't be claimed twice.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to claim your plan." }, { status: 401 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(PENDING_PLAN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "no_pending_plan" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: pending } = await admin
    .from("pending_plans")
    .select("intake, plan")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!pending) {
    cookieStore.delete(PENDING_PLAN_COOKIE);
    return NextResponse.json({ error: "expired" }, { status: 404 });
  }

  await persistPlan(supabase, user.id, pending.intake as IntakeData, pending.plan as Plan);
  await admin.from("pending_plans").delete().eq("token", token);
  cookieStore.delete(PENDING_PLAN_COOKIE);

  return NextResponse.json({ ok: true });
}
