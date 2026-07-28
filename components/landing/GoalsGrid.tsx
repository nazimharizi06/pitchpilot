import { Target, Shuffle, Send, Crosshair, Wind, HeartPulse, Repeat2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SKILL_CATEGORY_LABELS } from "@/lib/types";
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

// Each featured category gets its own gradient wash so the grid reads as
// tiered/varied without needing photography.
const GRADIENTS: Record<SkillCategory, string> = {
  ball_control: "from-emerald-500/25 via-emerald-500/0 to-transparent",
  dribbling: "from-sky-500/25 via-sky-500/0 to-transparent",
  passing: "from-amber-500/25 via-amber-500/0 to-transparent",
  shooting: "from-rose-500/25 via-rose-500/0 to-transparent",
  speed_agility: "from-violet-500/25 via-violet-500/0 to-transparent",
  endurance: "from-cyan-500/25 via-cyan-500/0 to-transparent",
  weak_foot: "from-lime-500/25 via-lime-500/0 to-transparent",
};

const ICON_COLORS: Record<SkillCategory, string> = {
  ball_control: "text-emerald-400",
  dribbling: "text-sky-400",
  passing: "text-amber-400",
  shooting: "text-rose-400",
  speed_agility: "text-violet-400",
  endurance: "text-cyan-400",
  weak_foot: "text-lime-400",
};

const FEATURED: SkillCategory[] = ["ball_control", "dribbling", "passing", "shooting"];
const COMPACT: SkillCategory[] = ["speed_agility", "endurance", "weak_foot"];

export function GoalsGrid() {
  return (
    <section id="goals" className="bg-zinc-900/30 border-y border-zinc-800 px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-emerald-400 mb-2">Training areas</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Every part of the game, covered
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {FEATURED.map((goal) => {
            const Icon = ICONS[goal];
            return (
              <div
                key={goal}
                className={`relative overflow-hidden rounded-2xl border border-zinc-800 p-6 bg-gradient-to-br ${GRADIENTS[goal]} hover:border-zinc-700 hover:-translate-y-0.5 transition-all`}
              >
                <div className={`h-11 w-11 rounded-xl bg-zinc-950 border border-zinc-800 ${ICON_COLORS[goal]} flex items-center justify-center mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm text-white mb-1">{SKILL_CATEGORY_LABELS[goal]}</h3>
                <p className="text-xs text-zinc-400">{BLURBS[goal]}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {COMPACT.map((goal) => {
            const Icon = ICONS[goal];
            return (
              <div
                key={goal}
                className="flex items-center gap-3 rounded-xl border border-zinc-800 p-4 hover:border-zinc-700 transition-all"
              >
                <div className={`h-10 w-10 rounded-lg bg-zinc-950 border border-zinc-800 ${ICON_COLORS[goal]} flex items-center justify-center shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-white">{SKILL_CATEGORY_LABELS[goal]}</h3>
                  <p className="text-xs text-zinc-400 truncate">{BLURBS[goal]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
