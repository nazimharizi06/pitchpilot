import { Target, Shuffle, Send, Crosshair, Wind, HeartPulse, Repeat2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SKILL_CATEGORIES, SKILL_CATEGORY_LABELS } from "@/lib/types";
import type { SkillCategory } from "@/lib/types";

const ICONS: Record<SkillCategory, LucideIcon> = {
  ball_control: Target,
  dribbling: Shuffle,
  passing: Send,
  shooting: Crosshair,
  speed_agility: Wind,
  endurance: HeartPulse,
  weak_foot: Repeat2,
};

const BLURBS: Record<SkillCategory, string> = {
  ball_control: "First touch and close control under pressure.",
  dribbling: "1v1 moves that create separation.",
  passing: "Accuracy and power over every distance.",
  shooting: "Finishing from every angle.",
  speed_agility: "Change of direction and top-end speed.",
  endurance: "The engine to compete for 90 minutes.",
  weak_foot: "Confidence on both feet, not just one.",
};

export function GoalsGrid() {
  return (
    <section id="goals" className="max-w-6xl mx-auto px-6 py-24 border-t border-zinc-200 dark:border-zinc-800">
      <div className="text-center mb-14">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">Training areas</p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Every part of the game, covered
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {SKILL_CATEGORIES.map((goal) => {
          const Icon = ICONS[goal];
          return (
            <div
              key={goal}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-md transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 mb-1">
                {SKILL_CATEGORY_LABELS[goal]}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{BLURBS[goal]}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
