import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionTier = "base" | "pro" | "premium";

const TIER_RANK: Record<SubscriptionTier, number> = {
  base: 1,
  pro: 2,
  premium: 3,
};

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export interface Subscription {
  tier: SubscriptionTier;
  status: string;
}

// Reads via the passed-in client so the "users can read their own row" RLS
// policy (see supabase/schema.sql) applies — no service-role key needed here.
export async function getActiveSubscription(supabase: SupabaseClient, userId: string): Promise<Subscription | null> {
  const { data } = await supabase.from("subscriptions").select("tier, status").eq("user_id", userId).maybeSingle();

  if (!data || !data.tier || !ACTIVE_STATUSES.has(data.status)) return null;
  return { tier: data.tier as SubscriptionTier, status: data.status };
}

export function meetsTier(subscription: Subscription | null, required: SubscriptionTier): boolean {
  if (!subscription) return false;
  return TIER_RANK[subscription.tier] >= TIER_RANK[required];
}
