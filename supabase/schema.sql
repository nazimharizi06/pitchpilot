-- One-time setup: paste this into the Supabase SQL editor for your project.
-- Accounts live in Supabase's built-in auth.users table — this only adds the
-- subscription-status table the Stripe webhook keeps in sync.

create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  tier text check (tier in ('base', 'pro', 'premium')),
  status text not null,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- Users can read their own subscription row (used to gate access in the app).
-- There is deliberately no insert/update policy for regular users — only the
-- Stripe webhook handler (using the service-role key, which bypasses RLS)
-- ever writes to this table.
create policy "Users can read their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- The current generated plan for a user. Regenerating (retake intake) replaces this row.
create table public.plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  intake jsonb not null,
  plan jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.plans enable row level security;
create policy "Users manage their own plan" on public.plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Per-day completion + per-drill checkboxes within that day. Rows are replaced
-- whenever plans.plan is regenerated (see app/api/generate-plan/route.ts).
create table public.session_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  day int not null,
  completed_at timestamptz,
  completed_drill_ids text[] not null default '{}',
  primary key (user_id, day)
);
alter table public.session_progress enable row level security;
create policy "Users manage their own session progress" on public.session_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Bookmarked drills from the library (independent of any generated plan).
create table public.favorite_drills (
  user_id uuid not null references auth.users(id) on delete cascade,
  drill_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, drill_id)
);
alter table public.favorite_drills enable row level security;
create policy "Users manage their own favorites" on public.favorite_drills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Collected once, before a user's first checkout attempt (see app/api/checkout/route.ts).
-- Immutable after insert — no insert/update policy for the browser client — since it
-- exists purely as a free-trial-abuse dedup signal, not a user-editable profile field.
create table public.user_phones (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone text not null,
  created_at timestamptz not null default now()
);
alter table public.user_phones enable row level security;
create policy "Users can read their own phone" on public.user_phones
  for select using (auth.uid() = user_id);

-- Append-only ledger of every completed checkout's email + phone. No policies at all —
-- service-role only (same posture as `subscriptions` being webhook-authority data) — so
-- it's never exposed to the browser client. Outlives the `subscriptions` row and the
-- Supabase account itself, so a deleted-and-recreated account, or a brand-new account
-- with a different email but the same phone, still gets caught before another free trial.
create table public.trial_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  phone text not null,
  used_at timestamptz not null default now()
);
alter table public.trial_usage enable row level security;
create index trial_usage_email_idx on public.trial_usage (email);
create index trial_usage_phone_idx on public.trial_usage (phone);

-- One pending/confirmed guardian-consent request per user (retaking intake as a minor
-- replaces it with a fresh token+intake). Created + confirmed only by server-side code
-- using the service-role key — no insert/update policy for the browser client.
create table public.guardian_verifications (
  user_id uuid primary key references auth.users(id) on delete cascade,
  token text not null unique,
  guardian_name text not null,
  guardian_email text not null,
  intake jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);
alter table public.guardian_verifications enable row level security;
create policy "Users can read their own guardian verification" on public.guardian_verifications
  for select using (auth.uid() = user_id);
