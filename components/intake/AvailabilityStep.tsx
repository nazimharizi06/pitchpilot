"use client";

import type { Equipment, GoalsAndAssessment, Space } from "@/lib/types";
import { Field, inputClass } from "@/components/ui/Field";

const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: "none", label: "No equipment — just a ball" },
  { value: "cones", label: "Cones" },
  { value: "wall", label: "A wall" },
  { value: "ladder", label: "Agility ladder" },
  { value: "goal", label: "A goal / net" },
  { value: "partner", label: "A training partner" },
];

export function AvailabilityStep({
  value,
  onChange,
}: {
  value: Pick<GoalsAndAssessment, "days_per_week" | "space_available" | "equipment_available">;
  onChange: (next: Pick<GoalsAndAssessment, "days_per_week" | "space_available" | "equipment_available">) => void;
}) {
  function toggleEquipment(item: Equipment) {
    const has = value.equipment_available.includes(item);
    let next = has ? value.equipment_available.filter((e) => e !== item) : [...value.equipment_available, item];
    if (item === "none" && !has) next = ["none"];
    if (item !== "none" && !has) next = next.filter((e) => e !== "none");
    onChange({ ...value, equipment_available: next });
  }

  return (
    <div className="flex flex-col gap-5">
      <Field label="How many days per week do you want to train?">
        <input
          type="number"
          className={inputClass}
          min={1}
          max={7}
          value={value.days_per_week}
          onChange={(e) => onChange({ ...value, days_per_week: Number(e.target.value) })}
        />
      </Field>

      <Field label="What's the biggest space you have access to?">
        <select
          className={inputClass}
          value={value.space_available}
          onChange={(e) => onChange({ ...value, space_available: e.target.value as Space })}
        >
          <option value="indoor">Small indoor space</option>
          <option value="yard">Yard</option>
          <option value="driveway">Driveway</option>
          <option value="full_field">Full field</option>
        </select>
      </Field>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">What equipment do you have?</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EQUIPMENT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2"
            >
              <input
                type="checkbox"
                checked={value.equipment_available.includes(opt.value)}
                onChange={() => toggleEquipment(opt.value)}
                className="h-4 w-4"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
