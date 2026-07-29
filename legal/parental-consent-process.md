> **DRAFT — prepared for attorney review. Not legal advice.** This document describes the actual technical
> mechanism PitchPilot uses today, so counsel can assess whether it's adequate — especially for COPPA if any
> users are under 13 — and recommend changes if not.

# Parental/Guardian Consent Process — how it actually works

## Why this exists

A minor typing a parent's name into a text field proves nothing — it's not a real signature and can't be
verified. PitchPilot's intake flow instead requires a separate, real email address belonging to the parent
or guardian, and blocks plan generation until that parent clicks a one-time confirmation link sent to that
address. This raises the bar (a minor would need actual access to that inbox to fake it) without requiring
a full identity-verification/KYC buildout.

## Step by step

1. During intake, if the account type is "Player" and the stated age is under 18, the form requires:
   - The parent/guardian's full name.
   - The parent/guardian's email address (separate from the player's own login email).
2. On submission, the training plan is **not** generated yet. Instead, the system:
   - Generates a random, single-use token.
   - Stores the token, guardian name/email, and the full intake data in a database row
     (`guardian_verifications`), marked "pending."
   - Emails a confirmation link (containing the token) to the guardian's email address via Resend.
3. The player sees a "waiting on guardian confirmation" screen and cannot yet see a generated plan.
4. When the guardian clicks the link (from any device, no PitchPilot account or login required on their
   part), the system:
   - Looks up the token, marks the request "confirmed," and records the confirmation timestamp.
   - Generates the training plan from the stored intake data and saves it to the player's account.
   - Shows the guardian a simple "thanks, the plan is being created" confirmation page.
5. The player's own browser tab periodically re-checks for the plan (roughly every 8 seconds) and displays it
   automatically once ready — no action needed from the player.

## What this mechanism does and doesn't prove

- **Does prove**: the person who accepted the waiver had access to the specific email inbox the player
  entered as "my parent/guardian's email."
- **Does not prove**: that the email address actually belongs to the player's real parent or legal guardian,
  that the person is actually an adult, or that the player didn't have independent access to that same inbox
  (e.g. a shared family email address).

## Questions for counsel

- Does this mechanism meet the bar for "verifiable parental consent" under COPPA (if PitchPilot has actual
  knowledge of users under 13)? If not, which of the FTC's recognized methods (e.g. a small credit-card
  charge, a signed consent form, government ID/video verification) should be added on top of this?
- Should the guardian's consent record (the confirmed `guardian_verifications` row, including timestamp and
  the exact waiver text version they confirmed) be retained longer / differently than PitchPilot's normal
  data-retention rules, as consent evidence?
- Is there a minimum age below which PitchPilot should not offer the Service at all, regardless of guardian
  consent?
