import { CalendarDays, Dumbbell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DrillChecklistItem } from "@/components/dashboard/DrillChecklistItem";
import { drillsById } from "@/lib/data/drills";
import type { Drill, PlanDrillEntry, PlanSession } from "@/lib/types";

const SESSION_TYPE_LABEL = { warm_up: "Warm-up", main: "Main set", cool_down: "Cool-down" } as const;

export function SamplePlanSection({ sessions: allSessions }: { sessions: PlanSession[] }) {
  // The real demo plan now spans 3 weeks (see lib/engine/generatePlan.ts) — the public
  // preview only needs to show one sample week, not all 21 days.
  const sessions = allSessions.filter((s) => s.week === 1);
  const featured = sessions[0];
  if (!featured) return null;

  const featuredDrills = featured.drills
    .map((entry) => ({ entry, drill: drillsById[entry.drillId] }))
    .filter((d): d is { entry: PlanDrillEntry; drill: Drill } => Boolean(d.drill));

  const equipment = Array.from(
    new Set(featuredDrills.flatMap(({ drill }) => drill.equipment).filter((e) => e !== "none"))
  );

  return (
    <section id="sample-plan" className="bg-zinc-950 px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-emerald-400 mb-2">Example weekly plan</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
            A real week, not a mockup
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            This is actual output from PitchPilot&apos;s engine for a sample player.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2 flex flex-col gap-2.5">
            <p className="text-xs font-semibold tracking-wide text-zinc-500 mb-1 flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" /> 7-DAY SCHEDULE
            </p>
            {sessions.map((session) => (
              <div
                key={session.day}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                  session.day === featured.day
                    ? "border-emerald-500 bg-emerald-950/20"
                    : "border-zinc-800 bg-zinc-900/40"
                }`}
              >
                <span className="text-sm font-medium text-white">
                  Day {session.day} — {session.theme}
                </span>
                <span className="text-xs text-zinc-500 whitespace-nowrap">~{session.target_duration_minutes} min</span>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3 rounded-[2rem] border-4 border-zinc-800 bg-zinc-900/60 p-3 shadow-2xl shadow-emerald-950/30">
          <div className="rounded-3xl bg-zinc-900/40 p-6">
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <h3 className="text-lg font-semibold text-white">
                Day {featured.day} — {featured.theme}
              </h3>
              <span className="text-xs text-zinc-400">~{featured.target_duration_minutes} min</span>
            </div>
            <p className="text-sm text-zinc-400 mb-4">{featured.explanation}</p>

            {equipment.length > 0 && (
              <div className="flex items-center flex-wrap gap-2 mb-5">
                <Dumbbell className="h-3.5 w-3.5 text-zinc-500" />
                {equipment.map((item) => (
                  <span
                    key={item}
                    className="text-xs text-zinc-400 border border-zinc-800 rounded-full px-2.5 py-1 capitalize"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              {(["warm_up", "main", "cool_down"] as const).map((type) => {
                const group = featuredDrills.filter(({ drill }) => drill.session_type === type);
                if (group.length === 0) return null;
                return (
                  <div key={type} className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-zinc-500">{SESSION_TYPE_LABEL[type]}</p>
                    {group.map(({ entry, drill }) => (
                      <DrillChecklistItem key={entry.drillId} drill={drill} repsDuration={entry.reps_duration} completed={false} readOnly />
                    ))}
                  </div>
                );
              })}
            </div>

            <Link href="/#pricing" className="block mt-6">
              <Button className="w-full sm:w-auto">Start Free for 7 Days</Button>
            </Link>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
