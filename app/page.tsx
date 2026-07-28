import Link from "next/link";
import { Button } from "@/components/ui/Button";

const TIERS = [
  {
    name: "Base",
    blurb: "Full intake, AI-generated plans, drill library, manual re-check, reminders.",
  },
  {
    name: "Pro",
    blurb: "Richer AI explanations, deeper progress tracking, multiple simultaneous training focuses.",
  },
  {
    name: "Premium",
    blurb: "Everything in Pro, plus drill demonstration videos.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      <section className="w-full max-w-3xl px-6 pt-24 pb-16 text-center">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-3">PitchPilot</p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
          A personalized soccer training plan, built for your kid.
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Answer a few questions about goals, level, and what you have to work with — get a structured week of
          training built from real coaching experience. More effective than generic free content, more affordable
          than a private coach.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/intake">
            <Button className="w-full sm:w-auto">Start your free 7-day trial</Button>
          </Link>
        </div>
      </section>

      <section className="w-full max-w-3xl px-6 py-12 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6 text-center">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">1. Tell us about your player</p>
            <p>Age, level, goals, equipment, and space — a quick multi-step intake, not a long form.</p>
          </div>
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">2. Get a real plan</p>
            <p>Ball control, dribbling, passing, shooting, speed, endurance, and weak foot — matched to what&apos;s actually possible for them.</p>
          </div>
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">3. Train, session by session</p>
            <p>One session unlocks at a time, with warm-up and cool-down built in every time.</p>
          </div>
        </div>
      </section>

      <section className="w-full max-w-3xl px-6 py-12 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6 text-center">Plans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TIERS.map((tier) => (
            <div key={tier.name} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">{tier.name}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{tier.blurb}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-4 text-center">
          7-day free trial, then billing begins. Cancel anytime going forward. No refunds.
        </p>
      </section>

      <footer className="w-full max-w-3xl px-6 py-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
        PitchPilot is a training tool, not a substitute for coaching supervision. Always train in a safe space
        appropriate for your skill level.
      </footer>
    </main>
  );
}
