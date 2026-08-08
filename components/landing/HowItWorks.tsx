import { ClipboardList, Sparkles, Flame } from "lucide-react";
import { PlanPreviewCard } from "@/components/landing/PlanPreviewCard";
import { Reveal } from "@/components/landing/Reveal";
import type { PlanSession } from "@/lib/types";

const STEPS = [
  { icon: ClipboardList, title: "Tell us about your game", body: "Position, goals, level and schedule." },
  {
    icon: Sparkles,
    title: "Get your personalized week",
    body: "PitchPilot builds sessions around what you actually need.",
  },
  { icon: Flame, title: "Train", body: "Open today's session and follow your drills." },
];

export function HowItWorks({ previewSession }: { previewSession: PlanSession }) {
  return (
    <section id="how-it-works" className="relative bg-zinc-950 px-6 py-14 md:py-24">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-8 md:mb-16">
          <p className="text-sm font-medium text-emerald-400 mb-2">See it in action</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white">
            From questions to training, in minutes
          </h2>
        </Reveal>

        <Reveal delay={100} className="grid grid-cols-3 gap-3 sm:gap-4 relative mb-8 md:mb-14">
          <div
            aria-hidden
            className="hidden sm:block absolute top-7 left-[16.5%] right-[16.5%] border-t-2 border-dashed border-emerald-900"
          />
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-center text-center gap-2 sm:gap-3">
              <div className="relative z-10 h-11 w-11 sm:h-14 sm:w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <step.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-zinc-200">
                  <span className="text-emerald-400 mr-1">{i + 1}.</span>
                  {step.title}
                </p>
                <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">{step.body}</p>
              </div>
            </div>
          ))}
        </Reveal>

        <Reveal delay={200} className="flex justify-center">
          <div className="rounded-[2rem] border-4 border-zinc-800 bg-zinc-900/60 p-3 shadow-2xl shadow-emerald-950/30">
            <div className="flex items-center gap-1.5 px-2 pb-2">
              <span className="h-2 w-2 rounded-full bg-zinc-700" />
              <span className="h-2 w-2 rounded-full bg-zinc-700" />
              <span className="h-2 w-2 rounded-full bg-zinc-700" />
            </div>
            <PlanPreviewCard session={previewSession} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
