import { NextResponse } from "next/server";
import { intakeDataSchema } from "@/lib/validation";
import { generatePlan } from "@/lib/engine/generatePlan";
import { mockProvider } from "@/lib/ai/mockProvider";
import { claudeProvider } from "@/lib/ai/claudeProvider";
import { createClient } from "@/lib/supabase/server";
import { getActiveSubscription, meetsTier } from "@/lib/subscriptions";

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

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = intakeDataSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message ?? "Invalid intake data" }, { status: 400 });
  }

  // Falls back to the deterministic mock provider when no key is configured,
  // so the app still runs with zero setup — see README.
  const provider = process.env.ANTHROPIC_API_KEY ? claudeProvider : mockProvider;
  const plan = await generatePlan(result.data, provider);
  return NextResponse.json(plan);
}
