import { SKILL_CATEGORY_LABELS } from "@/lib/types";
import type { SkillCategory } from "@/lib/types";
import { SKILL_ICONS as ICONS, SKILL_BLURBS as BLURBS, SKILL_GRADIENTS as GRADIENTS, SKILL_ICON_COLORS as ICON_COLORS } from "@/lib/skillMeta";

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
