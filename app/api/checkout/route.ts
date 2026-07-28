import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";
import type { SubscriptionTier } from "@/lib/subscriptions";

const PRICE_BY_TIER: Record<SubscriptionTier, string | undefined> = {
  base: process.env.STRIPE_PRICE_BASE,
  pro: process.env.STRIPE_PRICE_PRO,
  premium: process.env.STRIPE_PRICE_PREMIUM,
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const tier = body?.tier as SubscriptionTier | undefined;
  const priceId = tier && PRICE_BY_TIER[tier];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const stripe = getStripe();
  const admin = createAdminClient();

  // Reuse the Stripe customer already on file for this user, if any — the
  // subscriptions row is only created once the webhook sees a completed
  // checkout, so a first-time subscriber (or one who abandoned checkout
  // before completing it) won't have one yet.
  const { data: existing } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const customerId =
    existing?.stripe_customer_id ??
    (await stripe.customers.create({ email: user.email, metadata: { supabase_user_id: user.id } })).id;

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { trial_period_days: 7 },
    success_url: `${site}/plan?checkout=success`,
    cancel_url: `${site}/#pricing`,
  });

  return NextResponse.json({ url: session.url });
}
