import type { PlanSession } from "@/lib/types";
import { drillsById } from "@/lib/data/drills";
import { DrillCard } from "@/components/plan/DrillCard";
import { Button } from "@/components/ui/Button";

export function SessionCard({
  session,
  isLastUnlocked,
  hasMore,
  onUnlockNext,
}: {
  session: PlanSession;
  isLastUnlocked: boolean;
  hasMore: boolean;
  onUnlockNext: () => void;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Day {session.day} — {session.theme}
        </h2>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">~{session.target_duration_minutes} min</span>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-5">{session.explanation}</p>

      <div className="flex flex-col gap-3">
        {session.drills.map((entry, i) => {
          const drill = drillsById[entry.drillId];
          if (!drill) return null;
          return <DrillCard key={`${entry.drillId}-${i}`} drill={drill} repsDuration={entry.reps_duration} />;
        })}
      </div>

      {isLastUnlocked && hasMore && (
        <div className="mt-5">
          <Button onClick={onUnlockNext}>Mark complete & unlock next session</Button>
        </div>
      )}
    </section>
  );
}
