"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PlanPreviewCard } from "@/components/landing/PlanPreviewCard";
import { WeekFocusCard } from "@/components/landing/WeekFocusCard";
import { PitchLines } from "@/components/landing/PitchLines";
import { HeroVideoBackground } from "@/components/landing/HeroVideoBackground";
import type { PlanSession } from "@/lib/types";

export function Hero({
  previewSession,
  weekThemes,
  categoryCount,
  drillCount,
}: {
  previewSession: PlanSession;
  weekThemes: string[];
  categoryCount: number;
  drillCount: number;
}) {
  return (
    <section className="relative overflow-hidden bg-zinc-950">
      <HeroVideoBackground />
      <PitchLines className="absolute inset-0 h-full w-full text-emerald-500/[0.07]" />
      <div aria-hidden className="absolute inset-0 bg-dot-grid text-white/[0.03]" />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[36rem] w-[64rem] rounded-full bg-emerald-500/20 blur-3xl"
      />
      <div aria-hidden className="absolute top-20 right-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white mb-6 text-balance leading-[1.05]">
            Stop guessing{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              what to train.
            </span>
          </h1>
          <p className="text-lg text-zinc-400 mb-8 max-w-lg">
            A training program built around your position, your goals, and your level — not a generic
            workout plan.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link href="/#pricing" onClick={() => track("start_trial_click", { location: "hero" })}>
              <Button className="w-full sm:w-auto text-base px-6 py-3 gap-2">
                Start Free for 7 Days
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button
                variant="outlineDark"
                className="w-full sm:w-auto text-base px-6 py-3 gap-2 border-transparent text-zinc-400 hover:text-white hover:bg-transparent"
              >
                <PlayCircle className="h-4 w-4" />
                See how it works
              </Button>
            </a>
          </div>

          <div className="flex items-center gap-6 text-sm text-zinc-500 mb-3">
            <span>
              <strong className="text-white font-semibold">{categoryCount}</strong> training categories
            </span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>
              <strong className="text-white font-semibold">{drillCount}</strong> drills
            </span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>
              <strong className="text-white font-semibold">3</strong>-week programs
            </span>
          </div>
          <p className="text-xs text-zinc-500">7 days free. Cancel before the trial ends and you won&apos;t be charged.</p>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <svg
            aria-hidden
            viewBox="0 0 400 320"
            fill="none"
            className="absolute -top-16 -left-10 h-[26rem] w-[26rem] text-emerald-400/50 hidden sm:block"
          >
            <path
              d="M20 260 C 90 80, 230 40, 360 150"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="2 10"
              strokeLinecap="round"
            />
            <circle cx="360" cy="150" r="5" fill="currentColor" />
          </svg>

          <div className="absolute -bottom-8 -left-6 rotate-[-6deg] hidden sm:block animate-gentle-float">
            <WeekFocusCard themes={weekThemes} />
          </div>
          <div className="relative -rotate-2 animate-gentle-float [animation-delay:-3s]">
            <PlanPreviewCard session={previewSession} />
          </div>
        </div>
      </div>
    </section>
  );
}
