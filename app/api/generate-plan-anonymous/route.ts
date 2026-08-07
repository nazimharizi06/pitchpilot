import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { intakeDataSchema } from "@/lib/validation";
import { generatePlan } from "@/lib/engine/generatePlan";
import { getAiProvider } from "@/lib/planGeneration";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp, isAnonGenerationRateLimited, logAnonGeneration } from "@/lib/rateLimit";

export const maxDuration = 60;

const PENDING_PLAN_COOKIE = "pp_pending_token";

// Generates a real, final plan for a visitor who hasn't signed in yet — the
// "see your plan before you commit to an account" preview. Never persists to
// `plans` (that requires a real auth.uid()); instead stores the full plan in
// `pending_plans` (service-role only, no RLS policies reachable by the
// browser) and hands back only an opaque token via an httpOnly cookie. Only a
// derived teaser goes in the response body — the full plan is never sent to
// an unauthenticated browser.
export async function POST(request: Request) {
  const admin = createAdminClient();
  const ip = getClientIp(request);

  if (await isAnonGenerationRateLimited(admin, ip)) {
    return NextResponse.json(
      { error: "Too many plans built from this connection recently. Try again in a bit." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = intakeDataSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message ?? "Invalid intake data" }, { status: 400 });
  }

  const { profile } = result.data;
  const isMinorPlayer = profile.account_type === "player" && profile.age < 18;
  if (isMinorPlayer) {
    // A minor can't be previewed anonymously — their waiver needs a guardian
    // to confirm it, which needs a real signed-in account to attach to. The
    // /intake wizard should never call this route for a minor in the first
    // place; this is a defense-in-depth check, not the primary gate.
    return NextResponse.json({ error: "Sign in first to build a plan for a player under 18." }, { status: 400 });
  }

  await logAnonGeneration(admin, ip);

  const plan = await generatePlan(result.data, getAiProvider());

  const token = randomUUID();
  const { error: insertError } = await admin.from("pending_plans").insert({
    token,
    intake: result.data,
    plan,
  });
  if (insertError) {
    return NextResponse.json({ error: "Couldn't save your plan right now. Please try again." }, { status: 500 });
  }

  const cookieStore = await cookies();
  cookieStore.set(PENDING_PLAN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Lax (not Strict) so this cookie is still sent on the top-level GET
    // redirect back from Google's OAuth consent screen to /auth/callback —
    // that's what lets the pending plan survive sign-in.
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // matches pending_plans.expires_at
  });

  const week1 = plan.sessions.filter((s) => s.week === 1);
  const focusAreas = Array.from(new Set(week1.map((s) => s.theme))).slice(0, 3);

  return NextResponse.json({ dayCount: week1.length, focusAreas });
}
