import type { ReactNode } from "react";
import { Check } from "lucide-react";

// Only lists features that actually ship today — no "coming soon" items (e.g.
// drill demonstration videos, which have zero video assets anywhere in the
// drill library) belong in a strict comparison table.
const ROWS: { feature: string; base: ReactNode; pro: ReactNode; premium: ReactNode }[] = [
  { feature: "Full drill library, filterable by skill/level/equipment/space", base: true, pro: true, premium: true },
  { feature: "Favorite drills", base: true, pro: true, premium: true },
  { feature: "AI-generated 3-week training program", base: false, pro: true, premium: true },
  { feature: "Session-by-session AI explanations", base: false, pro: true, premium: true },
  { feature: "Progress tracking (streaks, completion, stats)", base: false, pro: true, premium: true },
  {
    feature: "Retake intake to refresh your plan",
    base: "—",
    pro: "After finishing your 3 weeks",
    premium: "Anytime",
  },
  { feature: "Priority support", base: false, pro: false, premium: true },
];

function Cell({ value }: { value: ReactNode }) {
  if (value === true) return <Check className="h-4 w-4 text-emerald-500 mx-auto" />;
  if (value === false) return <span className="text-zinc-700">—</span>;
  return <span className="text-xs text-zinc-300">{value}</span>;
}

export function ComparisonTable() {
  return (
    <div className="mt-12 overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-[560px]">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left font-medium text-zinc-400 py-3 pr-4">Feature</th>
            <th className="font-medium text-zinc-400 py-3 px-4 text-center">Base</th>
            <th className="font-medium text-zinc-400 py-3 px-4 text-center">Pro</th>
            <th className="font-medium text-zinc-400 py-3 px-4 text-center">Premium</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.feature} className="border-b border-zinc-900">
              <td className="py-3 pr-4 text-zinc-300">{row.feature}</td>
              <td className="py-3 px-4 text-center">
                <Cell value={row.base} />
              </td>
              <td className="py-3 px-4 text-center">
                <Cell value={row.pro} />
              </td>
              <td className="py-3 px-4 text-center">
                <Cell value={row.premium} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
