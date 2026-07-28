"use client";

import { Check } from "lucide-react";
import type { Equipment, GoalsAndAssessment, Space } from "@/lib/types";
import { Field, darkInputClass } from "@/components/ui/Field";

const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: "none", label: "No equipment — just a ball" },
  { value: "cones", label: "Cones" },
  { value: "wall", label: "A wall" },
  { value: "ladder", label: "Agility ladder" },
  { value: "goal", label: "A goal / net" },
  { value: "partner", label: "A training partner" },
];

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

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
      <Field dark label="How many days per week do you want to train?">
        <div className="flex flex-wrap gap-2">
          {DAY_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ ...value, days_per_week: n })}
              className={`h-10 w-10 rounded-full text-sm font-semibold transition-colors ${
                value.days_per_week === n
                  ? "bg-emerald-500 text-zinc-950"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </Field>

      <Field dark label="What's the biggest space you have access to?">
        <select
          className={darkInputClass}
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
        <span className="text-sm font-medium text-zinc-200">What equipment do you have?</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EQUIPMENT_OPTIONS.map((opt) => {
            const checked = value.equipment_available.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleEquipment(opt.value)}
                className={`flex items-center gap-2 text-sm rounded-xl border px-3 py-2 text-left transition-colors ${
                  checked
                    ? "border-emerald-500 bg-emerald-950/20 text-white"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <span
                  className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                    checked ? "bg-emerald-500 text-zinc-950" : "border border-zinc-700"
                  }`}
                >
                  {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
