import { CheckCircle2 } from "lucide-react";
import type { PlanSession } from "@/lib/types";
import { drillsById } from "@/lib/data/drills";

// `compact`: the mobile hero teaser — same real data, fewer rows and tighter
// padding so the card can peek into the first viewport instead of pushing it
// well past 100vh. Not a different component since it's the same session/
// drills, just a denser presentation.
export function PlanPreviewCard({ session, compact = false }: { session: PlanSession; compact?: boolean }) {
  const allDrills = session.drills.map((entry) => drillsById[entry.drillId]).filter(Boolean);
  const shown = compact ? 3 : 5;
  const drills = allDrills.slice(0, shown);

  return (
    <div
      className={`w-full ${compact ? "" : "max-w-[21rem]"} rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/40 overflow-hidden`}
    >
      <div className={`bg-gradient-to-br from-emerald-500 to-emerald-700 text-white ${compact ? "px-4 py-3" : "px-5 py-4"}`}>
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-100">Today</p>
        <p className={compact ? "text-base font-semibold" : "text-lg font-semibold"}>{session.theme}</p>
        <p className="text-xs text-emerald-100 mt-1">~{session.target_duration_minutes} min session</p>
      </div>
      <div className={`flex flex-col ${compact ? "gap-2 p-3" : "gap-2.5 p-4"}`}>
        {drills.map((d) => (
          <div key={d.id} className="flex items-center gap-2.5 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-zinc-300 truncate">{d.name}</span>
          </div>
        ))}
        {!compact && allDrills.length > 5 && <p className="text-xs text-zinc-500 pl-6.5">+{allDrills.length - 5} more</p>}
      </div>
    </div>
  );
}
