import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";
import { phoneSchema } from "@/lib/validation";
import { normalizePhone } from "@/lib/phone";
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

  // Phone number is required once, before a user's very first checkout — it's the
  // harder-to-fake signal (alongside email) used below to stop free-trial abuse
  // across deleted/recreated or multiple accounts. Immutable after first insert.
  const { data: phoneRow } = await admin.from("user_phones").select("phone").eq("user_id", user.id).maybeSingle();

  let phone = phoneRow?.phone ?? null;
  if (!phone) {
    const rawPhone = typeof body?.phone === "string" ? body.phone : null;
    const parsed = rawPhone ? phoneSchema.safeParse(rawPhone) : null;
    if (!parsed?.success) {
      return NextResponse.json({ error: "phone_required" }, { status: 400 });
    }
    phone = normalizePhone(parsed.data);
    await admin.from("user_phones").insert({ user_id: user.id, phone });
  }

  // Free-trial eligibility: has this email or phone ever completed a checkout
  // before? Checked against the append-only trial_usage ledger (not the mutable
  // `subscriptions` row), so it survives account deletion and catches a second
  // account signing up with a different email but the same phone.
  const email = user.email.toLowerCase();
  const [{ data: byEmail }, { data: byPhone }] = await Promise.all([
    admin.from("trial_usage").select("id").eq("email", email).limit(1).maybeSingle(),
    admin.from("trial_usage").select("id").eq("phone", phone).limit(1).maybeSingle(),
  ]);
  const eligibleForTrial = !byEmail && !byPhone;

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
