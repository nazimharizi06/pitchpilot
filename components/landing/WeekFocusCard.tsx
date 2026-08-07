import { Target } from "lucide-react";

// Small floating card showing the top training themes for the demo week —
// real output from the same engine, not a mockup. Deliberately doesn't state
// a specific session count here — days_per_week is user-chosen, so implying
// a fixed number (e.g. "7 Sessions") would misrepresent what every visitor
// actually gets. Capped at 3 themes to stay simple and legible.
export function WeekFocusCard({ themes }: { themes: string[] }) {
  return (
    <div className="w-56 rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/40 p-4 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-emerald-950/60 text-emerald-400 flex items-center justify-center shrink-0">
        <Target className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-0.5">This week</p>
        <p className="text-sm font-semibold text-white leading-snug">{themes.slice(0, 3).join(" · ")}</p>
      </div>
    </div>
  );
}
