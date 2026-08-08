"use client";

import { CalendarDays, ArrowRight } from "lucide-react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { PlanPreviewCard } from "@/components/landing/PlanPreviewCard";
import { Reveal } from "@/components/landing/Reveal";
import type { PlanSession } from "@/lib/types";

export function SamplePlanSection({ sessions: allSessions }: { sessions: PlanSession[] }) {
  // The real demo plan now spans 3 weeks (see lib/engine/generatePlan.ts) — the public
  // preview only needs to show one sample week, not all 21 days.
  const sessions = allSessions.filter((s) => s.week === 1);
  const featured = sessions[0];
  if (!featured) return null;

  return (
    <section id="sample-plan" className="bg-zinc-950 px-6 py-14 md:py-24">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-8 md:mb-14">
          <p className="text-sm font-medium text-emerald-400 mb-2">Example weekly plan</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white mb-3">
            A real week, not a mockup
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
            This is actual output from PitchPilot&apos;s engine for a sample player.
          </p>
        </Reveal>

        <Reveal delay={100} className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 items-start mb-8">
          <div className="lg:col-span-2 flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-wide text-zinc-500 mb-1 flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" /> 7-DAY SCHEDULE
            </p>
            {sessions.map((session) => (
              <div
                key={session.day}
                className={`flex items-center justify-between rounded-xl border px-4 py-2.5 ${
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

          <div className="lg:col-span-3 flex justify-center">
            <div className="rounded-[2rem] border-4 border-zinc-800 bg-zinc-900/60 p-3 shadow-2xl shadow-emerald-950/30 w-full max-w-sm">
              <div className="flex items-center gap-1.5 px-2 pb-2">
                <span className="h-2 w-2 rounded-full bg-zinc-700" />
                <span className="h-2 w-2 rounded-full bg-zinc-700" />
                <span className="h-2 w-2 rounded-full bg-zinc-700" />
              </div>
              <PlanPreviewCard session={featured} compact />
            </div>
          </div>
        </Reveal>

        <Reveal delay={150} className="text-center">
          <p className="text-sm text-zinc-400 mb-5">Your actual sessions are built around your answers.</p>
          <Link href="/intake" onClick={() => track("build_plan_click", { location: "sample_plan" })}>
            <Button className="px-6 py-3 gap-2">
              Build My Free Plan
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
