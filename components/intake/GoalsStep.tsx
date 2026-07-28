"use client";

import { Check } from "lucide-react";
import { SKILL_CATEGORIES, SKILL_CATEGORY_LABELS } from "@/lib/types";
import type { GoalsAndAssessment, Level, SkillCategory } from "@/lib/types";
import { SKILL_ICONS, SKILL_BLURBS, SKILL_ICON_COLORS } from "@/lib/skillMeta";

export function GoalsStep({
  value,
  onChange,
}: {
  value: Pick<GoalsAndAssessment, "goals" | "self_ratings">;
  onChange: (next: Pick<GoalsAndAssessment, "goals" | "self_ratings">) => void;
}) {
  function toggleGoal(goal: SkillCategory) {
    const selected = value.goals.includes(goal);
    const goals = selected ? value.goals.filter((g) => g !== goal) : [...value.goals, goal];
    const self_ratings = { ...value.self_ratings };
    if (selected) {
      delete self_ratings[goal];
    } else if (!self_ratings[goal]) {
      self_ratings[goal] = "beginner";
    }
    onChange({ goals, self_ratings });
  }

  function setRating(goal: SkillCategory, level: Level) {
    onChange({ ...value, self_ratings: { ...value.self_ratings, [goal]: level } });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-400">
        Pick everything you want to work on, then rate where you&apos;re at for each one.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SKILL_CATEGORIES.map((goal) => {
          const checked = value.goals.includes(goal);
          const Icon = SKILL_ICONS[goal];
          return (
            <div
              key={goal}
              className={`relative rounded-2xl border p-5 cursor-pointer transition-colors ${
                checked ? "border-emerald-500 bg-emerald-950/20" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
              }`}
              onClick={() => toggleGoal(goal)}
            >
              {checked && (
                <span className="absolute top-4 right-4 h-5 w-5 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
              <div className={`h-10 w-10 rounded-xl bg-zinc-950 border border-zinc-800 ${SKILL_ICON_COLORS[goal]} flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm text-white mb-1 pr-6">{SKILL_CATEGORY_LABELS[goal]}</h3>
              <p className="text-xs text-zinc-400 mb-3">{SKILL_BLURBS[goal]}</p>
              {checked && (
                <select
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={value.self_ratings[goal] ?? "beginner"}
                  onChange={(e) => setRating(goal, e.target.value as Level)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
