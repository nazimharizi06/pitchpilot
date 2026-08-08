"use client";

import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="bg-zinc-950 px-6 py-10 md:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 px-8 py-12 md:py-16 text-center">
          <div aria-hidden className="absolute inset-0 bg-dot-grid text-white/[0.06]" />
          <div aria-hidden className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div
            aria-hidden
            className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white mb-5"
          >
            <Trophy className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-3 relative">
            Ready to stop guessing?
          </h2>
          <p className="text-emerald-100 mb-7 max-w-md mx-auto relative">
            Build a training plan around your game, goals and schedule.
          </p>
          <Link
            href="/intake"
            className="relative inline-block"
            onClick={() => track("build_plan_click", { location: "final_cta" })}
          >
            <Button variant="inverse" className="text-base px-6 py-3 gap-2">
              Build My Free Plan
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-xs text-emerald-100/70 mt-4 relative">No account needed to see your personalized preview.</p>
        </div>
      </div>
    </section>
  );
}
