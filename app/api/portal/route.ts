import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";

// Creates a Stripe Billing Portal session so a subscriber can manage or
// cancel their plan without a custom account-settings page.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data } = await admin.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();

  if (!data?.stripe_customer_id) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${site}/plan`,
  });

  return NextResponse.json({ url: portalSession.url });
}
