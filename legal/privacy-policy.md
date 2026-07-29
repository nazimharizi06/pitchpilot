> **DRAFT — prepared for attorney review. Not final. Not legal advice. Do not publish or rely on this as
> binding until a licensed attorney in your operating jurisdiction has reviewed and approved it.**
>
> This draft describes what the PitchPilot codebase actually collects and where it actually sends data, as of
> this writing — a lawyer should confirm this stays accurate as the product changes, and should assess
> whether COPPA (children under 13), CCPA/CPRA (California), GDPR (if any EU/UK users), or other
> jurisdiction-specific privacy law applies and what additional disclosures/mechanisms (e.g. a "Do Not Sell/
> Share My Info" link, a formal Data Processing Agreement with each subprocessor) are required.

# Privacy Policy

**Last updated: [date]**

Nazim Mohamed Islam Harizi, a sole proprietor doing business as "**PitchPilot**" ("**we**," "**us**") operates
the PitchPilot website and app (the
"**Service**"). This Privacy Policy explains what personal information we collect, how we use it, and who we
share it with.

## 1. Information we collect

**Account information.** Email address and password (if you sign up directly), or your Google account email
(if you use "Continue with Google"). We do not receive your Google password.

**Profile and intake information**, collected when you build a training plan:
- Who is setting up the account (parent or player), age, height, weight, gender, dominant foot, position, and
  playing level.
- Training goals, self-rated skill level per goal, days per week available, space available, and equipment
  available.
- Any injuries or physical limitations you choose to share (optional).

**Parent/guardian information**, collected only if the player is under 18: the parent or guardian's name and
email address, used solely to send and record a one-time consent confirmation before a minor's training plan
is generated.

**Phone number.** Collected once, before your first subscription checkout, and used only to prevent the same
person from claiming multiple free trials under different email addresses. Not used for marketing or shared
beyond what's described in Section 3.

**Payment information.** Collected and processed directly by Stripe, our payment processor. We do not
receive or store your full card number — we receive limited billing metadata (e.g. subscription status,
plan tier, renewal date) from Stripe.

**Usage and progress data.** The training plan generated for you, which sessions/drills you've marked
complete, your favorited drills, and related streak/completion statistics.

**We do not currently use analytics, advertising, or tracking cookies.** The only cookies set are Supabase
authentication session cookies, necessary to keep you signed in.

## 2. How we use this information

- To create and generate your personalized training plan.
- To operate your account, subscription, and billing.
- To verify parental/guardian consent before generating a plan for a player under 18.
- To prevent free-trial abuse (checking email/phone against prior trial usage).
- To send you account-related and transactional emails only (sign-up confirmation, guardian-consent
  requests). PitchPilot does not currently have a marketing-email feature.

## 3. Who we share information with

We share information only with the service providers ("**subprocessors**") that operate PitchPilot, and only
as needed to provide the Service:

| Subprocessor | Purpose | What's shared |
|---|---|---|
| **Supabase** | Authentication and database hosting | All account and intake data described above |
| **Stripe** | Payment processing and subscription billing | Email, and whatever payment details you enter directly into Stripe's checkout — not seen by PitchPilot |
| **Resend** | Transactional email delivery | Email address, and email content (e.g. guardian-consent link) |
| **Anthropic** (Claude API) | Generates the personalized training plan text | Your intake data (age, goals, equipment, injury notes, etc.) is sent to Anthropic's API to produce the plan. Anthropic processes this per its own API terms `[lawyer/founder to confirm current data-retention terms under the Anthropic API agreement in effect]` |
| **Google** | Sign-in ("Continue with Google"), if you choose it | Your Google account email, per Google's OAuth flow |

We do not sell your personal information. `[Lawyer to confirm the specific "sale"/"sharing" definitions and
disclosures required under CCPA/CPRA if you have California users.]`

## 4. Children's privacy

PitchPilot is designed to be usable by players under 18, with parental/guardian involvement. If you are
under 18 and selected "Player" as your account type, PitchPilot requires a parent or legal guardian to
confirm a request (by email) before a training plan is generated for you — see our
[parental consent process](./parental-consent-process.md) for how this works technically.

`[This section needs specific attorney review for COPPA: if any users are under 13 and PitchPilot has actual
knowledge of that, COPPA's specific "verifiable parental consent," notice, and data-minimization requirements
apply and may require more than the current email-confirmation mechanism (e.g. FTC-approved verification
methods). Do not treat the current guardian-email flow as COPPA-sufficient without attorney confirmation.]`

## 5. Data retention

We retain your account and intake data for as long as your account is active, so we can regenerate/update
your training plan and preserve your progress history. If you delete your account, we delete your profile,
plan, and progress data, except:
- Records we're required to keep for billing/tax/legal purposes (via Stripe).
- A minimal record (email and phone number) kept in our free-trial-abuse ledger, to prevent the same person
  from repeatedly claiming new free trials with a new account — this is not linked back to your deleted
  profile data.

## 6. Your rights

Depending on where you live, you may have the right to access, correct, or delete your personal information,
or to object to certain processing. To exercise these rights, contact `[support email]`.
`[Lawyer to add jurisdiction-specific rights language — e.g. CCPA/CPRA rights for California residents,
GDPR rights if applicable.]`

## 7. Security

We use industry-standard measures (encryption in transit, access controls, and reputable infrastructure
providers) to protect your information, but no system is 100% secure.

## 8. International data transfers

`[Lawyer to confirm: where are Supabase/Stripe/Resend/Anthropic's servers located relative to your user
base, and whether any cross-border transfer disclosures (e.g. under GDPR) are required.]`

## 9. Changes to this policy

We may update this Privacy Policy from time to time. Material changes will be reflected by updating the
"Last updated" date above.

## 10. Contact

Questions about this Privacy Policy: `[support email]`.
