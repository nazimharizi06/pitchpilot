import { SKILL_CATEGORIES, SKILL_CATEGORY_LABELS } from "@/lib/types";
import { SKILL_ICONS as ICONS, SKILL_BLURBS as BLURBS, SKILL_GRADIENTS as GRADIENTS, SKILL_ICON_COLORS as ICON_COLORS } from "@/lib/skillMeta";
import { Reveal } from "@/components/landing/Reveal";

export function GoalsGrid() {
  return (
    <section id="goals" className="bg-zinc-950 px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-12">
          <p className="text-sm font-medium text-emerald-400 mb-2">Training areas</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Every part of the game, covered
          </h2>
        </Reveal>
      </div>

      <Reveal delay={100} className="scroll-fade-x">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 pb-4 max-w-6xl mx-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SKILL_CATEGORIES.map((goal) => {
            const Icon = ICONS[goal];
            return (
              <div
                key={goal}
                className={`snap-start shrink-0 w-56 relative overflow-hidden rounded-2xl border border-zinc-800 p-6 bg-gradient-to-br ${GRADIENTS[goal]} hover:border-zinc-700 hover:-translate-y-0.5 transition-all`}
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
      </Reveal>
    </section>
  );
}
