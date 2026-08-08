"use client";

import posthog from "posthog-js";

// Single entry point for all client-side product-analytics events — every
// call site in the app should import `track` from here, not `posthog`
// directly, so the "never break the UI" guarantee lives in one place.
// No-ops safely (not an error) if PostHog was never initialized (env vars
// unset — see components/PosthogProvider.tsx) or if the call throws for any
// other reason (blocked script, ad-blocker, network failure).
export function track(event: string, properties?: Record<string, unknown>) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthog.capture(event, properties);
  } catch {
    // Analytics must never break the product.
  }
}
