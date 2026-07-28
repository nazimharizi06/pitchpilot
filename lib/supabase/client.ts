import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client — used from client components (login form, user menu).
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
