import { NextResponse } from "next/server";
import { claimLoginTicket } from "@/lib/loginTickets";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Polled by the device that started sign-in. Once the ticket is claimed as
// completed (the other device confirmed the magic link), mints THIS device
// its own independent session — see lib/loginTickets.ts for why this is safe.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticket = searchParams.get("ticket");
  if (!ticket) {
    return NextResponse.json({ error: "Missing ticket" }, { status: 400 });
  }

  const claim = await claimLoginTicket(ticket);

  if (claim === "pending" || claim === "expired") {
    return NextResponse.json({ status: claim });
  }

  // claim is { email } — identity already proven by the other device's click.
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: claim.email });
  if (error || !data) {
    return NextResponse.json({ status: "expired" });
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: data.properties.hashed_token,
    type: "magiclink",
  });

  if (verifyError) {
    return NextResponse.json({ status: "expired" });
  }

  return NextResponse.json({ status: "completed" });
}
