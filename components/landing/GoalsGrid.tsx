import { SKILL_CATEGORIES, SKILL_CATEGORY_LABELS } from "@/lib/types";
import type { SkillCategory } from "@/lib/types";
import { SKILL_ICONS as ICONS, SKILL_ICON_COLORS as ICON_COLORS } from "@/lib/skillMeta";
import { drills } from "@/lib/data/drills";
import { POSITIONS } from "@/lib/types";
import { Reveal } from "@/components/landing/Reveal";

// A representative subset, not every category — the full library speaks for
// itself inside the product. This is a compact proof-of-depth, not a catalog.
const FEATURED: SkillCategory[] = ["shooting", "passing", "dribbling", "speed_agility", "defending"];
const moreCount = SKILL_CATEGORIES.length - FEATURED.length;

export function GoalsGrid() {
  return (
    <section id="goals" className="bg-zinc-950 px-6 py-12 md:py-20">
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <p className="text-sm font-medium text-emerald-400 mb-2">Training areas</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
            Every part of the game, covered
          </h2>
          <p className="text-sm text-zinc-400 mb-6">
            {SKILL_CATEGORIES.length} training areas · {drills.length} drills · {POSITIONS.length} positions
          </p>
        </Reveal>
        <Reveal delay={80} className="flex flex-wrap items-center justify-center gap-2.5">
          {FEATURED.map((goal) => {
            const Icon = ICONS[goal];
            return (
              <div
                key={goal}
                className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 pl-2.5 pr-4 py-2"
              >
                <span className={`h-6 w-6 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 ${ICON_COLORS[goal]}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm font-medium text-zinc-200">{SKILL_CATEGORY_LABELS[goal]}</span>
              </div>
            );
          })}
          <div className="flex items-center rounded-full border border-dashed border-zinc-700 px-4 py-2">
            <span className="text-sm font-medium text-zinc-500">+ {moreCount} more</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
