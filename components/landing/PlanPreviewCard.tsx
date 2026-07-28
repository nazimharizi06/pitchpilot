import { CheckCircle2 } from "lucide-react";
import type { PlanSession } from "@/lib/types";
import { drillsById } from "@/lib/data/drills";

export function PlanPreviewCard({ session }: { session: PlanSession }) {
  const drills = session.drills.map((entry) => drillsById[entry.drillId]).filter(Boolean);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-emerald-950/30 overflow-hidden">
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 px-5 py-4 text-white">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-100">Day {session.day}</p>
        <p className="text-lg font-semibold">{session.theme}</p>
        <p className="text-xs text-emerald-100 mt-1">~{session.target_duration_minutes} min session</p>
      </div>
      <div className="p-4 flex flex-col gap-2.5">
        {drills.slice(0, 5).map((d) => (
          <div key={d.id} className="flex items-center gap-2.5 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-zinc-300 truncate">{d.name}</span>
          </div>
        ))}
        {drills.length > 5 && <p className="text-xs text-zinc-500 pl-6.5">+{drills.length - 5} more</p>}
      </div>
    </div>
  );
}
