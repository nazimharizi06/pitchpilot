import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  value,
  label,
  iconClassName = "bg-emerald-950/60 text-emerald-400",
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconClassName?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconClassName}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-semibold text-white">{value}</p>
        <p className="text-xs text-zinc-400 truncate">{label}</p>
      </div>
    </div>
  );
}
