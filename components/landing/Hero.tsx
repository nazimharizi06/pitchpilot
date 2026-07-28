import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PlanPreviewCard } from "@/components/landing/PlanPreviewCard";
import type { PlanSession } from "@/lib/types";

export function Hero({ previewSession }: { previewSession: PlanSession }) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[36rem] w-[64rem] rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-3xl"
      />
      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-6">
            Built from real coaching experience
          </div>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5 text-balance">
            The training plan your player actually needs.
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-lg">
            A quick intake, then a personalized week of soccer training — ball control, dribbling, passing,
            shooting, speed, endurance, and weak foot — matched to their level, goals, and what you actually have to
            work with.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/intake">
              <Button className="w-full sm:w-auto text-base px-6 py-3">Start your free 7-day trial</Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto text-base px-6 py-3">
                See how it works
              </Button>
            </a>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-4">No card tricks. Cancel anytime going forward.</p>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="absolute -bottom-6 -right-4 rotate-3 opacity-40 blur-[1px] hidden sm:block">
            <PlanPreviewCard session={previewSession} />
          </div>
          <div className="relative -rotate-2">
            <PlanPreviewCard session={previewSession} />
          </div>
        </div>
      </div>
    </section>
  );
}
