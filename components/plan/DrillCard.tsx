import type { Drill } from "@/lib/types";

const SESSION_TYPE_LABEL: Record<Drill["session_type"], string> = {
  warm_up: "Warm-up",
  main: "Main",
  cool_down: "Cool-down",
};

export function DrillCard({ drill, repsDuration }: { drill: Drill; repsDuration: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            {SESSION_TYPE_LABEL[drill.session_type]}
          </span>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{drill.name}</h3>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{repsDuration}</span>
      </div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{drill.instructions}</p>
      {drill.progressions.length > 0 && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium">Level up: </span>
          {drill.progressions[0]}
        </p>
      )}
      {drill.weak_foot_variant && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium">Weak-foot variant: </span>
          {drill.weak_foot_variant}
        </p>
      )}
    </div>
  );
}
