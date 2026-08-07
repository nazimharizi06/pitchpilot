"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PlanPreviewCard } from "@/components/landing/PlanPreviewCard";
import { WeekFocusCard } from "@/components/landing/WeekFocusCard";
import { ProgressPreviewCard } from "@/components/landing/ProgressPreviewCard";
import { HeroBackgroundImage } from "@/components/landing/HeroBackgroundImage";
import { Reveal } from "@/components/landing/Reveal";
import type { PlanSession } from "@/lib/types";

export function Hero({
  previewSession,
  weekThemes,
  sessionCount,
  categoryCount,
  drillCount,
  positionCount,
}: {
  previewSession: PlanSession;
  weekThemes: string[];
  sessionCount: number;
  categoryCount: number;
  drillCount: number;
  positionCount: number;
}) {
  const progressTotal = sessionCount;
  const progressCompleted = sessionCount > 1 ? sessionCount - 1 : sessionCount;

  return (
    <section className="relative overflow-hidden bg-zinc-950">
      <HeroBackgroundImage />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-transparent to-zinc-950" />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[36rem] w-[64rem] rounded-full bg-emerald-500/20 blur-3xl"
      />
      <div aria-hidden className="absolute top-20 right-0 h-72 w-72 rounded-full bg-sky-500/5 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white mb-6 text-balance leading-[1.05]">
            Stop guessing{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              what to train.
            </span>
          </h1>
          <p className="text-lg text-zinc-400 mb-8 max-w-lg">Your game. Your goals. Your training plan.</p>

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
              <strong className="text-white font-semibold">{positionCount}</strong> positions covered
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

          <Reveal delay={250} className="absolute -top-10 -right-2 hidden sm:block">
            <div className="rotate-[4deg] animate-gentle-float [animation-delay:-1.5s]">
              <ProgressPreviewCard completed={progressCompleted} total={progressTotal} />
            </div>
          </Reveal>

          <Reveal delay={150} className="absolute -bottom-8 -left-6 hidden sm:block">
            <div className="rotate-[-6deg] animate-gentle-float">
              <WeekFocusCard sessionCount={sessionCount} themes={weekThemes} />
            </div>
          </Reveal>

          <Reveal delay={50} className="relative">
            <div className="-rotate-2 animate-gentle-float [animation-delay:-3s]">
              <PlanPreviewCard session={previewSession} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
