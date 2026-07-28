"use client";

import { SKILL_CATEGORIES, SKILL_CATEGORY_LABELS } from "@/lib/types";
import type { GoalsAndAssessment, Level, SkillCategory } from "@/lib/types";
import { inputClass } from "@/components/ui/Field";

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
    <div className="flex flex-col gap-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Pick everything you want to work on, then rate where you&apos;re at for each one.
      </p>
      {SKILL_CATEGORIES.map((goal) => {
        const checked = value.goals.includes(goal);
        return (
          <div
            key={goal}
            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border px-4 py-3 ${
              checked
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <label className="flex items-center gap-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              <input type="checkbox" checked={checked} onChange={() => toggleGoal(goal)} className="h-4 w-4" />
              {SKILL_CATEGORY_LABELS[goal]}
            </label>
            {checked && (
              <select
                className={inputClass}
                value={value.self_ratings[goal] ?? "beginner"}
                onChange={(e) => setRating(goal, e.target.value as Level)}
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
  );
}
