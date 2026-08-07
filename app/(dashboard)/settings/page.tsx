import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveSubscription } from "@/lib/subscriptions";
import { ManageSubscriptionButton } from "@/components/dashboard/ManageSubscriptionButton";
import { PlayerProfileForm } from "@/components/settings/PlayerProfileForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings");

  const subscription = await getActiveSubscription(supabase, user.id);

  return (
    <div className="px-6 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-white mb-1">Settings</h1>
      <p className="text-sm text-zinc-400 mb-8">Manage your account and subscription.</p>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 mb-6">
        <h2 className="text-sm font-semibold text-zinc-400 mb-1">Account</h2>
        <p className="text-white">{user.email}</p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 mb-6">
        <h2 className="text-sm font-semibold text-zinc-400 mb-1">Subscription</h2>
        <p className="text-white mb-4">
          {subscription ? (
            <>
              <span className="capitalize">{subscription.tier}</span> · <span className="capitalize">{subscription.status}</span>
            </>
          ) : (
            "No active subscription"
          )}
        </p>
        <ManageSubscriptionButton />
      </div>

      <PlayerProfileForm />
    </div>
  );
}
