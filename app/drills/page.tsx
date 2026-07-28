import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveSubscription, meetsTier } from "@/lib/subscriptions";
import { drills } from "@/lib/data/drills";
import { SKILL_CATEGORIES, SKILL_CATEGORY_LABELS } from "@/lib/types";
import { Header } from "@/components/landing/Header";
import { DrillCard } from "@/components/plan/DrillCard";

export default async function DrillsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/drills");

  const subscription = await getActiveSubscription(supabase, user.id);
  if (!meetsTier(subscription, "base")) redirect("/#pricing");

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Drill library</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          Every drill in PitchPilot&apos;s library, browsable anytime. Subscribe to Pro to turn these into a
          personalized weekly plan.
        </p>

        {SKILL_CATEGORIES.map((category) => {
          const categoryDrills = drills.filter((d) => d.categories.includes(category));
          if (categoryDrills.length === 0) return null;
          return (
            <section key={category} className="mb-10">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                {SKILL_CATEGORY_LABELS[category]}
              </h2>
              <div className="flex flex-col gap-3">
                {categoryDrills.map((drill) => (
                  <DrillCard key={drill.id} drill={drill} repsDuration={drill.reps_duration} />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}
