import { ClipboardList, Sparkles, CalendarCheck } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Tell us about your player",
    body: "Age, level, goals, equipment, and space — a quick multi-step intake, not a long form.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Get a real plan",
    body: "Rule-based filtering plus AI judgment balance every goal you picked into a week that actually fits.",
  },
  {
    number: "03",
    icon: CalendarCheck,
    title: "Train, session by session",
    body: "One session unlocks at a time, with warm-up and cool-down built in every time.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-zinc-950 px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-emerald-400 mb-2">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            From intake to training in minutes
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
          <div
            aria-hidden
            className="hidden sm:block absolute top-[68px] left-[16.5%] right-[16.5%] border-t-2 border-dashed border-emerald-900"
          />
          {STEPS.map((step) => (
            <div
              key={step.title}
              className="relative overflow-hidden flex flex-col items-center text-center rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 pt-10 hover:border-emerald-800 hover:-translate-y-0.5 transition-all"
            >
              <span
                aria-hidden
                className="absolute -top-3 -right-2 text-7xl font-bold text-white/[0.04] select-none"
              >
                {step.number}
              </span>
              <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-emerald-600/30 relative z-10">
                <step.icon className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-emerald-400 mb-1">STEP {step.number}</p>
              <h3 className="font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-400 max-w-xs">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
