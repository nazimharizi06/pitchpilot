import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client — bypasses row-level security. Only used server-side,
// by the Stripe webhook handler (which has no user session to authenticate
// as) and to look up a user's Stripe customer ID before checkout.
export function createAdminClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
