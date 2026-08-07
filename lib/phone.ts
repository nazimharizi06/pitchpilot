// Normalizes a user-entered phone number to a stable comparison/storage form
// ("(555) 123-4567" and "555-123-4567" both become "5551234567"), so free-trial
// dedup checks (see app/api/checkout/route.ts) aren't fooled by formatting
// differences. Pure string manipulation, no server-only APIs — also used
// client-side (components/landing/PhoneNumberModal.tsx) to build the E.164
// value sent to Supabase's phone-verification.
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/\D/g, "");
}
