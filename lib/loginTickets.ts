import { createAdminClient } from "@/lib/supabase/admin";

// Cross-device magic-link login handoff. A "ticket" correlates the device that
// started sign-in (which polls for completion) with whichever device actually
// clicks the email link (which marks the ticket complete once its own session
// is established). Tickets are single-use and short-lived — see
// supabase/schema.sql for the table and RLS posture (no client access at all;
// only the service-role admin client, used here, ever touches this table).

const TICKET_TTL_MS = 15 * 60 * 1000;

function isExpired(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() > TICKET_TTL_MS;
}

export async function createLoginTicket(email: string): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("login_tickets")
    .insert({ email: email.toLowerCase() })
    .select("id")
    .single();

  if (error || !data) throw new Error("Could not create login ticket");
  return data.id as string;
}

// Called from the device that actually clicked the magic link, right after
// that device's own session is established. Never throws — this is a
// best-effort side channel and must not block that device's own redirect.
export async function completeLoginTicket(ticket: string, email: string): Promise<void> {
  const admin = createAdminClient();
  const { data } = await admin.from("login_tickets").select("email, status, created_at").eq("id", ticket).maybeSingle();

  if (!data) return;
  if (data.status !== "pending") return;
  if (isExpired(data.created_at)) return;
  if (data.email.toLowerCase() !== email.toLowerCase()) return;

  await admin.from("login_tickets").update({ status: "completed" }).eq("id", ticket);
}

export type TicketClaim = "pending" | "expired" | { email: string };

// Called by the originating device's poll loop. Completed tickets are deleted
// on claim (single-use) so the same ticket can never mint a second session.
export async function claimLoginTicket(ticket: string): Promise<TicketClaim> {
  const admin = createAdminClient();
  const { data } = await admin.from("login_tickets").select("email, status, created_at").eq("id", ticket).maybeSingle();

  if (!data || isExpired(data.created_at)) {
    if (data) await admin.from("login_tickets").delete().eq("id", ticket);
    return "expired";
  }

  if (data.status === "pending") return "pending";

  await admin.from("login_tickets").delete().eq("id", ticket);
  return { email: data.email };
}
