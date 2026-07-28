# PitchPilot

Personalized soccer skill training plans, generated from a short intake form. This is the core MVP slice:
**intake wizard → AI-judgment plan generation → session-by-session plan viewer.** No accounts, payments, or
reminders yet — see "Not built yet" below.

Everything runs locally with **zero external accounts** — no Supabase, Stripe, Twilio, Resend, or Anthropic
keys required to try it.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click through the intake at `/intake`, and you'll land on a
generated week of training at `/plan`.

```bash
npm run test   # vitest — plan-generation engine logic
npm run build  # production build + type-check
npm run lint   # eslint
```

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
- `lib/ai/provider.ts` + `lib/ai/mockProvider.ts` — the AI-judgment layer (balancing goals, picking among
  matching drills, explaining sessions) behind a swappable interface. `mockProvider` is deterministic, no API
  key needed. `lib/ai/claudeProvider.ts` is a stub for wiring in a real Claude API call later.
- `lib/storage.ts` — intake + plan persistence. Currently `localStorage` only (no accounts/DB this pass).
- `app/intake`, `app/plan`, `app/api/generate-plan` — the wizard, the plan viewer, and the route handler that
  connects them.

## Swapping in real services (next passes, not done here)

Each of these was deliberately left as a mock/stub so this runs today with no setup. To go further:

1. **Claude API** — implement `lib/ai/claudeProvider.ts` against the `AIProvider` interface in
   `lib/ai/provider.ts`, then pass it into `generatePlan(intake, claudeProvider)` instead of the mock default.
   Needs `ANTHROPIC_API_KEY`.
2. **Supabase/Firebase** — replace `lib/storage.ts` with real reads/writes, add accounts (`account_type` already
   exists on `UserProfile`), and persist plans server-side instead of `localStorage`.
3. **Stripe** — pricing is decided: Base $10/mo, Pro $20/mo, Premium $50/mo (shown on the landing page). Still
   needed: Stripe products/prices for these three tiers, the 7-day-trial-then-charge flow, and checkout wired
   up to real accounts (currently the landing page tiers are informational only, no checkout).
4. **Twilio + Resend** — day-of and missed-session reminders.
5. **Re-check flow** — a manually-triggered flow that updates `self_ratings`/`goals` (not profile info) and lets
   the app suggest level-ups, per the doc.

## Gaps this project can't close (need the founder / a lawyer, not more code)

- Purchasing `pitchpilotapp.app`.
- Real COPPA/legal review and liability-waiver language — `components/intake/SafetyStep.tsx` currently shows
  clearly-labeled **placeholder** waiver text. Do not use this in front of real users/payments before a lawyer
  reviews it.
- Sourcing/filming drill demonstration videos (Premium tier feature).
- Creating the actual Supabase/Stripe/Twilio/Resend/Anthropic accounts and keys.

## Content review needed

`lib/data/drills.ts` is coaching content I drafted (Weak Foot drill refinement, new warm-up/cool-down drills,
weak-foot variant tags, and every drill's space/equipment/progressions/estimated_minutes) — per the planning
doc, this is exactly the kind of thing that should get a founder/coach review pass before it reaches real users.
