"use client";

import { POSITIONS, POSITION_LABELS } from "@/lib/types";
import type { UserProfile } from "@/lib/types";
import { Field, darkInputClass } from "@/components/ui/Field";

export type ProfileForm = Omit<UserProfile, "id">;

// Scrollable <select> instead of a number-input spinner — easier to pick a
// value on both desktop and mobile than the tiny native up/down arrows.
const AGE_OPTIONS = Array.from({ length: 96 }, (_, i) => i + 5); // 5..100, matches profileSchema

export function ProfileStep({
  value,
  onChange,
}: {
  value: ProfileForm;
  onChange: (next: ProfileForm) => void;
}) {
  const set = <K extends keyof ProfileForm>(key: K, val: ProfileForm[K]) => onChange({ ...value, [key]: val });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field dark label="Who's setting this up?">
        <select
          className={darkInputClass}
          value={value.account_type}
          onChange={(e) => set("account_type", e.target.value as ProfileForm["account_type"])}
        >
          <option value="parent">Parent</option>
          <option value="player">Player</option>
        </select>
      </Field>

      <Field dark label="Age">
        <select className={darkInputClass} value={value.age} onChange={(e) => set("age", Number(e.target.value))}>
          {AGE_OPTIONS.map((age) => (
            <option key={age} value={age}>
              {age}
            </option>
          ))}
        </select>
      </Field>

      <Field dark label="Position (optional)">
        <select
          className={darkInputClass}
          value={value.position ?? ""}
          onChange={(e) => set("position", (e.target.value || null) as ProfileForm["position"])}
        >
          <option value="">Prefer not to say</option>
          {POSITIONS.map((position) => (
            <option key={position} value={position}>
              {POSITION_LABELS[position]}
            </option>
          ))}
        </select>
      </Field>

      <Field dark label="Current playing level">
        <select
          className={darkInputClass}
          value={value.playing_level}
          onChange={(e) => set("playing_level", e.target.value as ProfileForm["playing_level"])}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </Field>
    </div>
  );
}
