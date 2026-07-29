import { Check } from "lucide-react";

// Only real, shipped behavior — no claim beyond what the engine actually does
// (e.g. no "designed for every position" since position isn't factored into
// drill selection today).
const POINTS = [
  "Built using real coaching experience",
  "Personalized for every player",
  "Adapts to your schedule",
  "Works with whatever equipment you have",
  "Built specifically for soccer — not general fitness",
];

export function WhyDifferentSection() {
  return (
    <section className="bg-zinc-900/30 border-y border-zinc-800 px-6 py-24">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-sm font-medium text-emerald-400 mb-2">Why PitchPilot</p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
          Built from real coaching experience.
        </h2>
        <p className="text-zinc-400 mb-10">
          Every training session was designed using years of playing, coaching, and working with youth
          athletes — not randomly generated workouts.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto">
          {POINTS.map((point) => (
            <div key={point} className="flex items-center gap-2.5 text-sm text-zinc-300">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              {point}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
