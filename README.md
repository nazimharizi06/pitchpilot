# PitchPilot

Personalized soccer skill training plans, generated from a short intake form. Core flow:
**intake wizard → AI-judgment plan generation → session-by-session plan viewer**, gated behind three
subscription tiers — Base (browse the drill library), Pro (generate AI plans), Premium (+ drill videos, not
built yet). Accounts and billing run on Supabase + Stripe, **in Stripe test mode only** — see
"Gaps this project can't close" below before this goes anywhere near real users or real money.

The AI-judgment layer (`lib/ai/*`) still runs with **zero external accounts** if you skip the
`ANTHROPIC_API_KEY` env var — it falls back to a deterministic mock provider. Accounts/billing, on the other
hand, now require Supabase + Stripe to be set up (see below) — without them, sign-in and checkout won't work.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll need to sign in and subscribe (test mode) before
`/intake` will actually generate a plan; `/drills` is reachable on any tier once signed in.

```bash
npm run test   # vitest — plan-generation engine logic
npm run build  # production build + type-check
npm run lint   # eslint
```

## Accounts + Stripe setup (one-time, test mode)

1. Create a free [Supabase](https://supabase.com) project. In its SQL editor, run `supabase/schema.sql` once —
   this adds the `subscriptions` table (accounts themselves use Supabase's built-in `auth.users`).
2. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   and `SUPABASE_SERVICE_ROLE_KEY` from Project Settings → API.
3. Grab **test-mode** keys from the [Stripe dashboard](https://dashboard.stripe.com) and set `STRIPE_SECRET_KEY`.
4. Run `node scripts/stripe-setup.mjs` — creates the Base/Pro/Premium products + monthly prices in test mode and
   prints the three `STRIPE_PRICE_*` values to paste into `.env.local`. Safe to re-run (it reuses existing
   products instead of duplicating them).
5. In a separate terminal, run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (requires the
   [Stripe CLI](https://stripe.com/docs/stripe-cli)) and paste the printed webhook signing secret into
   `STRIPE_WEBHOOK_SECRET`.
6. `npm run dev`, sign in at `/login` (magic-link email, no password), subscribe with test card
   `4242 4242 4242 4242` / any future date / any CVC.

## How it's organized

- `lib/types.ts` — the data schema from the planning doc (Drill, UserProfile, GoalsAndAssessment, Plan).
- `lib/data/drills.ts` — the full drill library: every category/level from the doc, plus the previously-open
  gaps filled in — warm-up/cool-down drills, `weak_foot_variant` tags, `space`/`equipment`/`progressions`, and
  an added `estimated_minutes` field (not in the original schema table) used to budget drills against the
  45-60 min session target.
- `lib/engine/filter.ts` — rule-based hard filters (equipment, space, level, category) with the fallback chain
  for when a filter combo matches zero drills: widen level → relax equipment → relax space (last resort).
- `lib/engine/schedule.ts` — fits warm-up + as many main drills as fit the time budget + cool-down.
- `lib/engine/generatePlan.ts` — orchestrates filtering, scheduling, and the AI-judgment layer into a full week.
- `lib/ai/provider.ts` + `lib/ai/mockProvider.ts` + `lib/ai/claudeProvider.ts` — the AI-judgment layer
  (balancing goals, picking among matching drills, explaining sessions) behind a swappable async interface.
  `mockProvider` is deterministic, no API key needed. `lib/ai/claudeProvider.ts` calls the real Claude API
  (`claude-opus-5`) for the two jobs that need actual judgment — weighting goals against each other and
  writing each session's explanation; drill-picking and weighting-summary text are deterministic bookkeeping
  shared by both providers via `lib/ai/heuristics.ts`. The API route (`app/api/generate-plan/route.ts`) uses
  `claudeProvider` when `ANTHROPIC_API_KEY` is set, otherwise falls back to `mockProvider` — see `.env.example`.
- `lib/storage.ts` — intake + plan persistence. Still `localStorage` only — accounts/billing are wired up, but
  the actual intake/plan data hasn't been moved to Supabase yet (see "Swapping in real services").
- `lib/subscriptions.ts` — reads a user's subscription row and checks it against a required tier
  (`base` < `pro` < `premium`); used to gate `/drills` and `/api/generate-plan`.
- `lib/supabase/{client,server,admin}.ts` — Supabase clients for the browser, server (respects the
  "read your own row" RLS policy in `supabase/schema.sql`), and the service-role admin client (webhook writes
  only — bypasses RLS).
- `lib/stripe/client.ts` + `scripts/stripe-setup.mjs` — lazy Stripe client and the one-time product/price setup
  script (see "Accounts + Stripe setup" above).
- `proxy.ts` (project root) — refreshes the Supabase session cookie on every request. Named `proxy.ts`, not
  `middleware.ts` — this Next.js version renamed the convention (see `node_modules/next/dist/docs/.../proxy.md`).
- `app/login`, `app/auth/callback`, `components/auth/UserMenu.tsx` — magic-link sign-in/out.
- `app/api/checkout`, `app/api/portal`, `app/api/webhooks/stripe` — Stripe Checkout session creation, the
  Billing Portal (manage/cancel), and the webhook that keeps `subscriptions` in sync with Stripe.
- `app/drills` — Base-tier-and-up drill library browsing page.
- `app/intake`, `app/plan`, `app/api/generate-plan` — the wizard, the plan viewer, and the route handler that
  connects them; `/api/generate-plan` now requires a signed-in user on Pro or Premium.

## Swapping in real services (next passes, not done here)

1. **Claude API** — done: `lib/ai/claudeProvider.ts` implements the `AIProvider` interface for real, and
   `app/api/generate-plan/route.ts` uses it automatically whenever `ANTHROPIC_API_KEY` is set (see
   `.env.example`). No key means the app still runs on the deterministic mock provider.
2. **Supabase (accounts + subscriptions)** — done: magic-link auth, a `subscriptions` table, and tier gating on
   `/drills` and `/api/generate-plan`. **Not done:** `lib/storage.ts` (intake/plan data) still lives in
   `localStorage` instead of Supabase — a signed-in user's plan doesn't follow them across devices yet.
3. **Stripe** — done, **in test mode only**: `scripts/stripe-setup.mjs` creates the three priced products, the
   landing page's pricing buttons start a real (test) Checkout session with a 7-day trial, and a webhook keeps
   subscription status in sync. **Not done:** switching to live keys (see the legal gap below first).
4. **Twilio + Resend** — day-of and missed-session reminders.
5. **Re-check flow** — a manually-triggered flow that updates `self_ratings`/`goals` (not profile info) and lets
   the app suggest level-ups, per the doc.
6. **Premium video gating** — `DrillCard` already conditionally renders `video_url`, but no real URLs exist yet
   (all `null` in `lib/data/drills.ts`), so there's nothing to actually gate behind Premium today.

## Gaps this project can't close (need the founder / a lawyer, not more code)

- **Do not switch Stripe to live mode / take real payments before a lawyer reviews the waiver below.** This
  matters more than usual here — the product targets kids down to U8.
- Purchasing `pitchpilotapp.app`.
- Real COPPA/legal review and liability-waiver language — `components/intake/SafetyStep.tsx` currently shows
  clearly-labeled **placeholder** waiver text. Do not use this in front of real users/payments before a lawyer
  reviews it.
- Sourcing/filming drill demonstration videos (Premium tier feature).
- Creating the actual Supabase/Stripe/Twilio/Resend/Anthropic accounts and keys (Supabase + Stripe test-mode
  setup steps are above; Twilio/Resend are still unstarted).

## Content review needed

`lib/data/drills.ts` is coaching content I drafted (Weak Foot drill refinement, new warm-up/cool-down drills,
weak-foot variant tags, and every drill's space/equipment/progressions/estimated_minutes) — per the planning
doc, this is exactly the kind of thing that should get a founder/coach review pass before it reaches real users.
