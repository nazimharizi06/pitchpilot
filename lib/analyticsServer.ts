import { PostHog } from "posthog-node";

// Server-side counterpart to lib/analytics.ts — used only from Route Handlers
// (currently just the Stripe webhook, where the event that matters happens
// server-side, not in the browser). Lazily constructed, same "no key
// configured -> stay null" pattern as lib/stripe/client.ts.
let _client: PostHog | null | undefined;
function getClient(): PostHog | null {
  if (_client !== undefined) return _client;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  _client = key ? new PostHog(key, { host }) : null;
  return _client;
}

// Route Handlers run in short-lived serverless functions that can terminate
// right after the response is sent, so this awaits a flush rather than
// relying on posthog-node's normal background batching to catch up later.
export async function trackServer(distinctId: string, event: string, properties?: Record<string, unknown>) {
  const client = getClient();
  if (!client) return;
  try {
    client.capture({ distinctId, event, properties });
    await client.flush();
  } catch {
    // Analytics must never break webhook processing.
  }
}
