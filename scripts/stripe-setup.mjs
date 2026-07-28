// One-time script: creates the Base/Pro/Premium Stripe products + monthly
// prices in test mode and prints the price IDs to paste into .env.local.
// Run with: node scripts/stripe-setup.mjs
//
// Safe to re-run — it looks for an existing product by name before creating
// a new one, so it won't create duplicates.

import { readFileSync, existsSync } from "node:fs";
import Stripe from "stripe";

function loadEnvLocal() {
  const path = new URL("../.env.local", import.meta.url);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not set (checked process.env and .env.local).");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const TIERS = [
  { envVar: "STRIPE_PRICE_BASE", name: "PitchPilot Base", amount: 1000 },
  { envVar: "STRIPE_PRICE_PRO", name: "PitchPilot Pro", amount: 2000 },
  { envVar: "STRIPE_PRICE_PREMIUM", name: "PitchPilot Premium", amount: 5000 },
];

const results = [];

for (const tier of TIERS) {
  const existingProducts = await stripe.products.list({ limit: 100 });
  let product = existingProducts.data.find((p) => p.name === tier.name && p.active);

  if (!product) {
    product = await stripe.products.create({ name: tier.name });
    console.log(`Created product: ${tier.name} (${product.id})`);
  } else {
    console.log(`Reusing existing product: ${tier.name} (${product.id})`);
  }

  const existingPrices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
  let price = existingPrices.data.find(
    (p) => p.unit_amount === tier.amount && p.recurring?.interval === "month" && p.currency === "usd"
  );

  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: tier.amount,
      currency: "usd",
      recurring: { interval: "month" },
    });
    console.log(`Created price: $${tier.amount / 100}/mo (${price.id})`);
  } else {
    console.log(`Reusing existing price: $${tier.amount / 100}/mo (${price.id})`);
  }

  results.push({ envVar: tier.envVar, priceId: price.id });
}

console.log("\nPaste these into .env.local:\n");
for (const { envVar, priceId } of results) {
  console.log(`${envVar}=${priceId}`);
}
