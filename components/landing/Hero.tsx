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
      {/* Uniform mobile scrim — below md the layout is a single column at
          nearly full width, so the left-biased desktop gradient below isn't
          enough on its own to keep text readable everywhere behind it. */}
      <div aria-hidden className="absolute inset-0 bg-zinc-950/55 md:hidden" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-transparent to-zinc-950" />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[36rem] w-[64rem] rounded-full bg-emerald-500/20 blur-3xl"
      />
      <div aria-hidden className="absolute top-20 right-0 h-72 w-72 rounded-full bg-sky-500/5 blur-3xl" />

      {/* MOBILE — a deliberately different composition, not the desktop
          layout compressed. Tight top-to-bottom flow (headline → short
          subhead → one dominant CTA → a link-style secondary action → a
          one-line stat proof → a small disclaimer), then the workout card is
          pushed to the bottom of a ~100svh box via mt-auto, so its top edge
          lands right around the fold — visible without owning the screen. */}
      <div className="relative md:hidden flex flex-col min-h-[100svh] px-6 pt-24 pb-8">
        <h1 className="text-[clamp(2.5rem,1.1rem+8vw,3.5rem)] font-semibold tracking-tight text-white mb-3 text-balance leading-[1.05]">
          Stop guessing{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
            what to train.
          </span>
        </h1>
        <p className="text-base text-zinc-300 mb-5 max-w-xs">Your game. Your goals. Your training plan.</p>

        <div className="flex flex-col items-start gap-2.5 mb-5">
          <Link href="/intake" className="w-full" onClick={() => track("start_trial_click", { location: "hero_mobile" })}>
            <Button className="w-full text-base px-6 py-3 gap-2">
              Start Free for 7 Days
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#how-it-works" className="text-sm text-zinc-400 underline underline-offset-2 hover:text-white transition-colors">
            See how it works
          </a>
        </div>

        <p className="text-sm text-zinc-300 mb-1.5">
          <strong className="text-white font-semibold">{categoryCount}</strong> categories{" "}
          <span className="text-zinc-600">·</span> <strong className="text-white font-semibold">{drillCount}</strong> drills{" "}
          <span className="text-zinc-600">·</span> <strong className="text-white font-semibold">{positionCount}</strong> positions
        </p>
        <p className="text-[11px] text-zinc-500 mb-2">7 days free. Cancel before the trial ends and you won&apos;t be charged.</p>

        <div className="mt-auto pt-6">
          <Reveal>
            <PlanPreviewCard session={previewSession} compact />
          </Reveal>
        </div>
      </div>

      {/* TABLET / DESKTOP — unchanged composition from the previous pass. */}
      <div className="relative hidden md:grid max-w-6xl mx-auto px-6 pt-24 pb-28 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-[clamp(2.75rem,1.5rem+5vw,4.5rem)] font-semibold tracking-tight text-white mb-6 text-balance leading-[1.05]">
            Stop guessing{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              what to train.
            </span>
          </h1>
          <p className="text-lg text-zinc-300 mb-8 max-w-lg">Your game. Your goals. Your training plan.</p>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link href="/intake" onClick={() => track("start_trial_click", { location: "hero" })}>
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

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400 mb-3">
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
          <p className="text-xs text-zinc-400">7 days free. Cancel before the trial ends and you won&apos;t be charged.</p>
        </div>

        <div className="relative flex justify-center md:justify-end">
          <svg
            aria-hidden
            viewBox="0 0 400 320"
            fill="none"
            className="absolute -top-16 -left-10 h-[26rem] w-[26rem] text-emerald-400/50 hidden lg:block"
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

          <Reveal delay={250} className="absolute -top-24 -right-6 hidden lg:block">
            <div className="rotate-[4deg] animate-gentle-float [animation-delay:-1.5s]">
              <ProgressPreviewCard completed={progressCompleted} total={progressTotal} />
            </div>
          </Reveal>

          <Reveal delay={150} className="absolute -bottom-8 -left-6 hidden md:block">
            <div className="rotate-[-6deg] animate-gentle-float">
              <WeekFocusCard themes={weekThemes} />
            </div>
          </Reveal>

          <Reveal delay={50} className="relative md:translate-x-8">
            <div className="-rotate-2 animate-gentle-float [animation-delay:-3s]">
              <PlanPreviewCard session={previewSession} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
