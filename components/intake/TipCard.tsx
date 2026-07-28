import type { LucideIcon } from "lucide-react";

export function TipCard({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 h-fit">
      <div className="h-11 w-11 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-zinc-400">{body}</p>
    </div>
  );
}
