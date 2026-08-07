"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Target, Wrench, ClipboardList, CalendarCheck, ListChecks, Repeat2 } from "lucide-react";

// Cosmetic step labels loosely describing the real phases of
// lib/engine/generatePlan.ts (goal weighting → equipment/space filtering →
// drill selection/session assembly → AI-written explanations) — auto-advance
// on a timer, not real backend telemetry, purely to make the wait feel
// purposeful rather than a fake measured progress claim.
const STEPS = [
  { icon: Target, label: "Looking at your goals" },
  { icon: Wrench, label: "Matching your setup" },
  { icon: ClipboardList, label: "Choosing your sessions" },
  { icon: Repeat2, label: "Balancing your week" },
];

const WHAT_YOU_GET = [
  { icon: CalendarCheck, label: "Personalized sessions" },
  { icon: ListChecks, label: "Progress tracking" },
  { icon: Target, label: "Adapted to your level" },
  { icon: Repeat2, label: "Warm-up & cool-down built in" },
];

export function PlanGeneratingScreen() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-6 py-12 max-w-4xl mx-auto">
      <p className="text-xs font-semibold tracking-wide text-emerald-400 mb-2">YOUR TRAINING PLAN</p>
      <h1 className="text-4xl font-semibold text-white mb-3">
        Building your plan<span className="text-emerald-400">...</span>
      </h1>
      <p className="text-zinc-400 max-w-lg mb-10">We&apos;re putting your training week together.</p>

      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  i <= activeStep ? "bg-emerald-950/60 text-emerald-400" : "bg-zinc-900 text-zinc-600"
                }`}
              >
                <step.icon className="h-4 w-4" />
              </div>
              <span className={`text-sm hidden sm:block ${i <= activeStep ? "text-white" : "text-zinc-500"}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="hidden sm:block flex-1 border-t-2 border-dashed border-zinc-800" />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-10 text-center mb-8">
        <div className="relative h-20 w-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Image src="/brand/pitchpilot-icon.png" alt="" width={44} height={44} className="rounded-lg" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Crafting your plan...</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Hang tight, we&apos;re putting together the perfect week of training for you.
        </p>
        <div className="relative h-2 rounded-full bg-zinc-800 overflow-hidden max-w-sm mx-auto">
          <div className="absolute inset-y-0 w-1/3 bg-emerald-500 rounded-full animate-indeterminate-bar" />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">What you get</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {WHAT_YOU_GET.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <item.icon className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-xs text-zinc-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
