"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { createClient } from "@/lib/supabase/client";

// Guards against React Strict Mode's double-effect in dev, and any
// remount — posthog.init() should only ever run once per page load.
let initialized = false;

// Mounted once in app/layout.tsx, alongside (not replacing) the existing
// <Analytics /> (Vercel). Configuration choices, deliberately conservative:
//
// - person_profiles: "identified_only" — anonymous pre-signup browsing is
//   tracked lightly; a full "person" profile is only created once identify()
//   fires below, keeping data footprint and usage down.
// - persistence: "localStorage" (not the default "localStorage+cookie") —
//   PostHog never sets an actual browser cookie. The anonymous distinct_id
//   still persists across page loads in the same browser, which is what lets
//   pre-signup activity (landing page, pricing clicks) merge into the account
//   once identify() runs — it just does it without a cookie.
// - autocapture: false — the only data PostHog ever receives is the exact
//   named events this codebase deliberately sends via lib/analytics.ts,
//   nothing incidental from automatic DOM click/interaction capture.
// - disable_session_recording: true — explicit, on top of leaving session
//   recording off in the PostHog project settings.
export function PosthogProvider() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!key || initialized) return;
    initialized = true;

    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      persistence: "localStorage",
      autocapture: false,
      capture_pageview: true,
      disable_session_recording: true,
    });

    const supabase = createClient();

    // Supabase user ID only, as the distinct ID — no email/name/other
    // properties ever passed to identify(). Skipping the call entirely when
    // PostHog's distinct ID already matches avoids re-sending an $identify
    // event (and its person-profile update) on every mount/auth-state tick
    // once a session is already established.
    supabase.auth.getUser().then(({ data }) => {
      if (data.user && posthog.get_distinct_id() !== data.user.id) {
        posthog.identify(data.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        if (posthog.get_distinct_id() !== session.user.id) {
          posthog.identify(session.user.id);
        }
      }
      if (event === "SIGNED_OUT") {
        posthog.reset();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
