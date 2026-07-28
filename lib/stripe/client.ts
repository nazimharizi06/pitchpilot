import Stripe from "stripe";

// Constructed lazily so importing this module doesn't require a key at
// import time — mirrors the pattern in lib/ai/claudeProvider.ts.
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  return (_stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY!));
}
