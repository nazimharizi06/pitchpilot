import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";
import type { SubscriptionTier } from "@/lib/subscriptions";

type BillingInterval = "monthly" | "annual";

const PRICE_BY_TIER: Record<SubscriptionTier, Record<BillingInterval, string | undefined>> = {
  base: { monthly: process.env.STRIPE_PRICE_BASE, annual: process.env.STRIPE_PRICE_BASE_ANNUAL },
  pro: { monthly: process.env.STRIPE_PRICE_PRO, annual: process.env.STRIPE_PRICE_PRO_ANNUAL },
  premium: { monthly: process.env.STRIPE_PRICE_PREMIUM, annual: process.env.STRIPE_PRICE_PREMIUM_ANNUAL },
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
  const interval: BillingInterval = body?.interval === "annual" ? "annual" : "monthly";
  const priceId = tier && PRICE_BY_TIER[tier][interval];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const stripe = getStripe();
  const admin = createAdminClient();

  // Free-trial eligibility: has this email ever completed a checkout before?
  // Checked against the append-only trial_usage ledger (not the mutable
  // `subscriptions` row), so it survives account deletion. Email-only by
  // design — a determined abuser could create another email, but that's an
  // accepted tradeoff for launch rather than adding more checkout friction.
  const email = user.email.toLowerCase();
  const { data: byEmail } = await admin.from("trial_usage").select("id").eq("email", email).limit(1).maybeSingle();
  const eligibleForTrial = !byEmail;

  // Reuse the Stripe customer already on file for this user, if any — the
  // subscriptions row is only created once the webhook sees a completed
  // checkout, so a first-time subscriber (or one who abandoned checkout
  // before completing it) won't have one yet.
  const { data: existing } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  // A stored customer ID can go stale (e.g. manually deleted in the Stripe
  // dashboard while clearing test data) — verify it still exists before reusing
  // it, rather than letting checkout.sessions.create fail with "No such customer".
  let customerId: string | null = null;
  if (existing?.stripe_customer_id) {
    try {
      const customer = await stripe.customers.retrieve(existing.stripe_customer_id);
      if (!customer.deleted) customerId = customer.id;
    } catch {
      // Stale/missing customer — fall through to creating a fresh one below.
    }
  }
  if (!customerId) {
    customerId = (await stripe.customers.create({ email: user.email, metadata: { supabase_user_id: user.id } })).id;
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: eligibleForTrial ? { trial_period_days: 7 } : {},
    success_url: `${site}/plan?checkout=success`,
    cancel_url: `${site}/#pricing`,
  });

  return NextResponse.json({ url: session.url });
}
