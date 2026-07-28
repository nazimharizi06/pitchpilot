import { Target } from "lucide-react";

// Small floating card alongside the day-1 preview, showing the actual set of
// themes the demo plan covers across the week — real output from the same
// engine, not a mockup.
export function WeekFocusCard({ themes }: { themes: string[] }) {
  return (
    <div className="w-56 rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl shadow-emerald-950/30 p-4 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-emerald-950/60 text-emerald-400 flex items-center justify-center shrink-0">
        <Target className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-zinc-500">This week&apos;s focus</p>
        <p className="text-sm font-semibold text-white truncate">{themes.join(" · ")}</p>
      </div>
    </div>
  );
}
