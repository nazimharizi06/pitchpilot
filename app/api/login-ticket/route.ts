import { NextResponse } from "next/server";
import { createLoginTicket } from "@/lib/loginTickets";

// Creates a login ticket so /login can poll for completion if the magic link
// ends up being clicked on a different device — see lib/loginTickets.ts.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const ticket = await createLoginTicket(email);
  return NextResponse.json({ ticket });
}
