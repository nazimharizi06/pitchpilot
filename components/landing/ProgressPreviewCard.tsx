// Small floating card illustrating the real session-completion tracking
// feature (the "Sessions completed" stat on /plan). There's no logged-in
// visitor state to show on an anonymous marketing page, so these numbers are
// a representative example of that shipped feature, not live data.
export function ProgressPreviewCard({ completed, total }: { completed: number; total: number }) {
  const pct = Math.round((completed / total) * 100);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <div className="w-56 rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/40 p-4 flex items-center gap-3">
      <svg viewBox="0 0 44 44" className="h-10 w-10 shrink-0 -rotate-90">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-zinc-800" />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-emerald-500"
        />
      </svg>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-zinc-500">Progress</p>
        <p className="text-sm font-semibold text-white">
          {completed} / {total}
        </p>
        <p className="text-xs text-zinc-400 truncate">sessions completed</p>
      </div>
    </div>
  );
}
