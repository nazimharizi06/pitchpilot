import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { completeLoginTicket } from "@/lib/loginTickets";

// Where the magic-link email redirects back to. Exchanges the code for a
// session (setting the auth cookies) then sends the user on to `next`.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const ticket = searchParams.get("ticket");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    // Best-effort: if sign-in was started on a different device, let that
    // device's poll loop know it can mint its own session now — see
    // lib/loginTickets.ts. Never let this block this device's own redirect.
    if (ticket) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        await completeLoginTicket(ticket, user.email).catch(() => {});
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
