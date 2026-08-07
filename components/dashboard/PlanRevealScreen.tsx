"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/landing/Reveal";
import type { Plan } from "@/lib/types";

// The moment generation finishes — shown once (app/(dashboard)/plan/page.tsx
// gates this on a ?reveal=1 query param set only right after a successful
// POST /api/generate-plan), before falling through to the normal locked or
// unlocked plan view.
export function PlanRevealScreen({ plan, onContinue }: { plan: Plan; onContinue: () => void }) {
  const week1 = plan.sessions.filter((s) => s.week === 1);

  return (
    <div className="px-6 py-16 max-w-2xl mx-auto text-center">
      <Reveal className="mb-10">
        <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-600/30">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-4xl font-semibold text-white mb-3">Your plan is ready.</h1>
        <p className="text-zinc-400">Built around your position, your goals, and your level.</p>
      </Reveal>

      <Reveal delay={150} className="flex flex-col gap-2.5 mb-10 text-left">
        <p className="text-xs font-semibold tracking-wide text-zinc-500 mb-1 text-center">YOUR FIRST WEEK</p>
        {week1.map((session) => (
          <div
            key={session.day}
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
          >
            <span className="text-sm font-medium text-white">
              Day {session.day} — {session.theme}
            </span>
            <span className="text-xs text-zinc-500">~{session.target_duration_minutes} min</span>
          </div>
        ))}
      </Reveal>

      <Reveal delay={300}>
        <Button onClick={onContinue} className="px-8 py-3 text-base">
          See my plan
        </Button>
      </Reveal>
    </div>
  );
}
