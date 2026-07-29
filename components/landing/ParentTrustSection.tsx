import { MailCheck, HeartPulse, Gauge, ShieldCheck } from "lucide-react";

// Only describes mechanisms that actually exist in the product today — no
// claim of a separate "parent-controlled account" system, since a minor's
// account is still their own; only waiver acceptance is guardian-gated.
const POINTS = [
  {
    icon: MailCheck,
    title: "Guardian confirmation for players under 18",
    body: "If a player is under 18, we email their parent or guardian a confirmation link, and no plan is generated until they confirm — a typed name alone never grants access.",
  },
  {
    icon: HeartPulse,
    title: "Injuries and limitations, taken seriously",
    body: "Intake asks about current injuries or physical limitations, and that information shapes which drills go into the plan.",
  },
  {
    icon: Gauge,
    title: "Skill level, rated separately from age",
    body: "A 15-year-old can still start as a Beginner — the plan is built around actual ability, not assumed by age.",
  },
  {
    icon: ShieldCheck,
    title: "A real waiver, not a formality",
    body: "Every account reviews and accepts a liability waiver before training — adults for themselves, guardians on behalf of a minor.",
  },
];

export function ParentTrustSection() {
  return (
    <section className="bg-zinc-900/30 border-y border-zinc-800 px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-emerald-400 mb-2">For parents</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">Built with parents in mind</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {POINTS.map((point) => (
            <div key={point.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="h-10 w-10 rounded-lg bg-emerald-950/60 text-emerald-400 flex items-center justify-center mb-4">
                <point.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white mb-1.5">{point.title}</h3>
              <p className="text-sm text-zinc-400">{point.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
