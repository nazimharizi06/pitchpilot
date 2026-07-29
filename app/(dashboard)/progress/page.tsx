import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Flame, Target, Clock, ListChecks, CheckCircle2, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { computeStats, loadPlanState } from "@/lib/planProgress";
import { StatCard } from "@/components/dashboard/StatCard";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/progress");

  const state = await loadPlanState(supabase, user.id);

  if (!state) {
    return (
      <div className="px-6 py-12 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-2">Progress</h1>
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
  const stats = computeStats(plan.sessions, progress);

  const sessionsByWeek = new Map<number, typeof plan.sessions>();
  for (const session of plan.sessions) {
    const list = sessionsByWeek.get(session.week) ?? [];
    list.push(session);
    sessionsByWeek.set(session.week, list);
  }
  const weeks = Array.from(sessionsByWeek.keys()).sort((a, b) => a - b);

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-white mb-1">Progress</h1>
      <p className="text-sm text-zinc-400 mb-8">How your training is actually going.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        <StatCard icon={Flame} value={stats.streak} label="Day streak" iconClassName="bg-orange-950/60 text-orange-400" />
        <StatCard icon={CalendarDays} value={stats.sessionsCompleted} label="Sessions completed" />
        <StatCard icon={Target} value={`${stats.completionPct}%`} label="Plan completion" />
        <StatCard icon={Clock} value={stats.totalMinutes} label="Total minutes" iconClassName="bg-sky-950/60 text-sky-400" />
        <StatCard icon={ListChecks} value={stats.drillsCompleted} label="Drills completed" />
      </div>

      {weeks.map((week) => (
        <div key={week} className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Week {week}</h2>
          <div className="flex flex-col gap-2">
            {sessionsByWeek.get(week)!.map((session) => {
              const dayProgress = progress.find((p) => p.day === session.day);
              const completed = Boolean(dayProgress?.completed_at);
              const drillsDone = dayProgress?.completed_drill_ids.length ?? 0;
              return (
                <div
                  key={session.day}
                  className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-zinc-600 shrink-0" />
                    )}
                    <span className="text-sm text-white truncate">
                      Day {session.day} — {session.theme}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 whitespace-nowrap">
                    {drillsDone}/{session.drills.length} drills
                    {completed && dayProgress?.completed_at
                      ? ` · ${new Date(dayProgress.completed_at).toLocaleDateString()}`
                      : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
