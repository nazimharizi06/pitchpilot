import { ClipboardList, Sparkles, CalendarCheck } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Tell us about your player",
    body: "Age, level, goals, equipment, and space — a quick multi-step intake, not a long form.",
  },
  {
    icon: Sparkles,
    title: "Get a real plan",
    body: "Rule-based filtering plus AI judgment balance every goal you picked into a week that actually fits.",
  },
  {
    icon: CalendarCheck,
    title: "Train, session by session",
    body: "One session unlocks at a time, with warm-up and cool-down built in every time.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-14">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">How it works</p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          From intake to training in minutes
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
        <div
          aria-hidden
          className="hidden sm:block absolute top-7 left-[16.5%] right-[16.5%] h-px bg-zinc-200 dark:bg-zinc-800"
        />
        {STEPS.map((step, i) => (
          <div key={step.title} className="relative flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-emerald-600/20 relative z-10">
              <step.icon className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">STEP {i + 1}</p>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">{step.title}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xs">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
