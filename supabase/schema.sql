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
