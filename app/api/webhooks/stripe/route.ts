import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { trackServer } from "@/lib/analyticsServer";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionTier } from "@/lib/subscriptions";

// Both the monthly and annual Price for a tier must map to the same tier here —
// otherwise an annual subscriber gets `tier: null` written below and every
// meetsTier() check in the app breaks for them. See scripts/stripe-setup.mjs.
const TIER_BY_PRICE: Partial<Record<string, SubscriptionTier>> = {
  [process.env.STRIPE_PRICE_BASE ?? ""]: "base",
  [process.env.STRIPE_PRICE_BASE_ANNUAL ?? ""]: "base",
  [process.env.STRIPE_PRICE_PRO ?? ""]: "pro",
  [process.env.STRIPE_PRICE_PRO_ANNUAL ?? ""]: "pro",
  [process.env.STRIPE_PRICE_PREMIUM ?? ""]: "premium",
  [process.env.STRIPE_PRICE_PREMIUM_ANNUAL ?? ""]: "premium",
};

// Subscription billing-period fields live per-item (not on the subscription
// itself) as of this Stripe API version — see stripe/cjs/resources/SubscriptionItems.d.ts.
function currentPeriodEnd(subscription: Stripe.Subscription): string | null {
  const seconds = subscription.items.data[0]?.current_period_end;
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

async function upsertFromSubscription(
  admin: ReturnType<typeof createAdminClient>,
  userId: string | null,
  customerId: string,
  subscription: Stripe.Subscription
) {
  const priceId = subscription.items.data[0]?.price.id;
  const tier = priceId ? TIER_BY_PRICE[priceId] : undefined;

  if (userId) {
    // First time we see this user — insert (or replace) the full row.
    await admin.from("subscriptions").upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      tier: tier ?? null,
      status: subscription.status,
      current_period_end: currentPeriodEnd(subscription),
      updated_at: new Date().toISOString(),
    });
  } else {
    // Later lifecycle events key off the subscription/customer id instead.
    await admin
      .from("subscriptions")
      .update({
        tier: tier ?? null,
        status: subscription.status,
        current_period_end: currentPeriodEnd(subscription),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);
  }
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

      if (userId && customerId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await upsertFromSubscription(admin, userId, customerId, subscription);

        // Record this email in the free-trial-abuse ledger — this is the one place
        // a subscription is actually granted, so any future signup with the same
        // email should never get another trial. See app/api/checkout/route.ts for
        // the eligibility check this feeds.
        const { data: authUser } = await admin.auth.admin.getUserById(userId);
        if (authUser.user?.email) {
          await admin.from("trial_usage").insert({
            user_id: userId,
            email: authUser.user.email.toLowerCase(),
          });
        }

        const priceId = subscription.items.data[0]?.price.id;
        const tier = (priceId && TIER_BY_PRICE[priceId]) ?? "unknown";
        await trackServer(userId, "checkout_completed", { tier });
        // Distinct from checkout_completed — every checkout fires that one,
        // trial or not; this fires only when Stripe actually granted a trial
        // (subscription_data.trial_period_days in app/api/checkout/route.ts).
        if (subscription.status === "trialing") {
          await trackServer(userId, "trial_started", { tier });
        }
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      await upsertFromSubscription(admin, null, customerId, subscription);

      // Neither event carries a Supabase user_id directly (only later lifecycle
      // events, keyed by subscription/customer id) — look it up from the row
      // this webhook itself created during checkout.session.completed, purely
      // for attributing these two analytics events to the right person.
      const { data: subRow } = await admin
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", subscription.id)
        .maybeSingle();

      if (subRow?.user_id) {
        if (event.type === "customer.subscription.deleted") {
          await trackServer(subRow.user_id, "subscription_canceled", {});
        } else {
          // trial -> active is the one specific transition that counts as a
          // real conversion — Stripe includes previous_attributes on update
          // events specifically to make this kind of diff possible.
          const previousAttributes = event.data.previous_attributes as Partial<Stripe.Subscription> | undefined;
          if (previousAttributes?.status === "trialing" && subscription.status === "active") {
            const priceId = subscription.items.data[0]?.price.id;
            await trackServer(subRow.user_id, "trial_converted", {
              tier: (priceId && TIER_BY_PRICE[priceId]) ?? "unknown",
            });
          }
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
