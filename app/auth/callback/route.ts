import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Where the magic-link email redirects back to. Exchanges the code for a
// session (setting the auth cookies) then sends the user on to `next`.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
