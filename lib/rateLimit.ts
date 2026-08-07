import type { SupabaseClient } from "@supabase/supabase-js";

const ANON_GENERATION_LIMIT = 5;
const ANON_GENERATION_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Vercel (and most proxies) set x-forwarded-for as "client, proxy1, proxy2...".
// No rate-limiting existed anywhere in the app before this — this is the one
// endpoint that runs real AI generation with no authentication, so it's the
// one place that needs a throttle.
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// Service-role only (anon_generation_log has no RLS policies) — checked
// before every anonymous plan generation. Non-invasive: just an IP + a
// timestamp, no fingerprinting, no cross-site tracking.
export async function isAnonGenerationRateLimited(admin: SupabaseClient, ip: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - ANON_GENERATION_WINDOW_MS).toISOString();
  const { count } = await admin
    .from("anon_generation_log")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", windowStart);
  return (count ?? 0) >= ANON_GENERATION_LIMIT;
}

export async function logAnonGeneration(admin: SupabaseClient, ip: string): Promise<void> {
  await admin.from("anon_generation_log").insert({ ip });
}
