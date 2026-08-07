"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/landing/Reveal";

// The pre-auth moment: real generation just finished, but nothing detailed
// is shown yet — only a minimal summary (day count + top focus areas). The
// full plan lives server-side in `pending_plans` and only ever reaches the
// browser after sign-in (see app/api/claim-pending-plan/route.ts).
export function AnonymousPlanTeaser({
  dayCount,
  focusAreas,
  onSeePlan,
}: {
  dayCount: number;
  focusAreas: string[];
  onSeePlan: () => void;
}) {
  return (
    <div className="px-6 py-16 max-w-lg mx-auto text-center">
      <Reveal>
        <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-600/30">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="text-xs font-semibold tracking-wide text-emerald-400 mb-2">YOUR PLAN IS READY</p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-8">Your plan is ready.</h1>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 mb-8 text-left">
          <p className="text-lg font-semibold text-white mb-4">{dayCount} training days per week</p>
          <p className="text-xs font-semibold tracking-wide text-zinc-500 mb-2">FOCUSED ON</p>
          <div className="flex flex-wrap gap-2">
            {focusAreas.map((area) => (
              <span
                key={area}
                className="rounded-full border border-emerald-800 bg-emerald-950/40 px-3 py-1 text-sm text-emerald-300"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        <Button onClick={onSeePlan} className="w-full px-8 py-3 text-base">
          See My Plan
        </Button>
      </Reveal>
    </div>
  );
}
