import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { trackServer } from "@/lib/analyticsServer";

// Where email confirmation and OAuth (Google) redirect back to. Exchanges
// the code for a session (setting the auth cookies) then sends the user on
// to `next`.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    const user = data.user;

    // Supabase doesn't tell the client "this was a brand-new signup" directly
    // for OAuth — created_at and last_sign_in_at land within a few seconds of
    // each other only on a genuinely first-ever sign-in; a returning user's
    // last_sign_in_at is always well after their original created_at. A
    // heuristic, not a guarantee, since Supabase doesn't expose that
    // distinction any more precisely than this.
    if (user?.created_at && user.last_sign_in_at) {
      const createdMs = new Date(user.created_at).getTime();
      const signedInMs = new Date(user.last_sign_in_at).getTime();
      if (Math.abs(signedInMs - createdMs) < 10_000) {
        await trackServer(user.id, "account_created", {});
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
