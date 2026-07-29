import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { track } from "@vercel/analytics/server";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionTier } from "@/lib/subscriptions";

const TIER_BY_PRICE: Partial<Record<string, SubscriptionTier>> = {
  [process.env.STRIPE_PRICE_BASE ?? ""]: "base",
  [process.env.STRIPE_PRICE_PRO ?? ""]: "pro",
  [process.env.STRIPE_PRICE_PREMIUM ?? ""]: "premium",
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

        // Record this email + phone in the free-trial-abuse ledger — this is the one
        // place a subscription is actually granted, so any future signup (even a
        // different account) with the same email or phone should never get another
        // trial. See app/api/checkout/route.ts for the eligibility check this feeds.
        const [{ data: authUser }, { data: phoneRow }] = await Promise.all([
          admin.auth.admin.getUserById(userId),
          admin.from("user_phones").select("phone").eq("user_id", userId).maybeSingle(),
        ]);
        if (authUser.user?.email && phoneRow?.phone) {
          await admin.from("trial_usage").insert({
            user_id: userId,
            email: authUser.user.email.toLowerCase(),
            phone: phoneRow.phone,
          });
        }

        const priceId = subscription.items.data[0]?.price.id;
        await track("checkout_completed", { tier: (priceId && TIER_BY_PRICE[priceId]) ?? "unknown" });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      await upsertFromSubscription(admin, null, customerId, subscription);
      if (event.type === "customer.subscription.deleted") {
        await track("subscription_canceled", {});
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
