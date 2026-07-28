import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadPlanState, isDayUnlocked } from "@/lib/planProgress";
import { drillsById } from "@/lib/data/drills";
import { DrillChecklistItem } from "@/components/dashboard/DrillChecklistItem";

export default async function SessionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/sessions");

  const state = await loadPlanState(supabase, user.id);

  if (!state) {
    return (
      <div className="px-6 py-12 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-2">Sessions</h1>
        <p className="text-sm text-zinc-400">
          You don&apos;t have a generated plan yet.{" "}
          <Link href="/intake" className="underline text-emerald-400">
            Build one
          </Link>
          .
        </p>
      </div>
    );
  }

  const { plan, progress } = state;

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-white mb-1">Sessions</h1>
      <p className="text-sm text-zinc-400 mb-8">Every session in your current plan, day by day.</p>

      <div className="flex flex-col gap-6">
        {plan.sessions.map((session) => {
          const unlocked = isDayUnlocked(session.day, progress);
          const dayProgress = progress.find((p) => p.day === session.day);
          const completed = Boolean(dayProgress?.completed_at);

          if (!unlocked) {
            return (
              <div
                key={session.day}
                className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/20 px-5 py-4 opacity-60"
              >
                <span className="text-sm font-medium text-zinc-400">
                  Day {session.day} — {session.theme}
                </span>
                <span className="text-xs text-zinc-500">~{session.target_duration_minutes} min · Locked</span>
              </div>
            );
          }

          return (
            <section key={session.day} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h2 className="text-lg font-semibold text-white">
                  Day {session.day} — {session.theme}
                </h2>
                <span className="text-xs text-zinc-400">
                  ~{session.target_duration_minutes} min{completed ? " · Completed" : ""}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mb-5">{session.explanation}</p>
              <div className="flex flex-col gap-2.5">
                {session.drills.map((entry) => {
                  const drill = drillsById[entry.drillId];
                  if (!drill) return null;
                  return (
                    <DrillChecklistItem
                      key={entry.drillId}
                      drill={drill}
                      repsDuration={entry.reps_duration}
                      completed={dayProgress?.completed_drill_ids.includes(entry.drillId) ?? false}
                      readOnly
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
