import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Plan } from "@/lib/types";

const PENDING_PLAN_COOKIE = "pp_pending_token";

// Lets the client ask "is there a pending plan waiting for me?" — used on
// /intake mount (both right after anonymous generation and after a refresh)
// without ever exposing the httpOnly cookie itself to client-side JS. Only
// ever returns the same small teaser generate-plan-anonymous already sent
// once — never the full plan.
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PENDING_PLAN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ pending: false });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("pending_plans")
    .select("plan")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ pending: false });
  }

  const plan = data.plan as Plan;
  const week1 = plan.sessions.filter((s) => s.week === 1);
  const focusAreas = Array.from(new Set(week1.map((s) => s.theme))).slice(0, 3);

  return NextResponse.json({ pending: true, dayCount: week1.length, focusAreas });
}
