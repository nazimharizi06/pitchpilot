"use client";

import type { UserProfile } from "@/lib/types";
import { Field, darkInputClass } from "@/components/ui/Field";

export type ProfileForm = Omit<UserProfile, "id">;

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
        <input
          type="number"
          className={darkInputClass}
          value={value.age}
          min={5}
          max={100}
          onChange={(e) => set("age", Number(e.target.value))}
        />
      </Field>

      <Field dark label="Gender">
        <select
          className={darkInputClass}
          value={value.gender}
          onChange={(e) => set("gender", e.target.value as ProfileForm["gender"])}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
      </Field>

      <Field dark label="Dominant foot">
        <select
          className={darkInputClass}
          value={value.dominant_foot}
          onChange={(e) => set("dominant_foot", e.target.value as ProfileForm["dominant_foot"])}
        >
          <option value="right">Right</option>
          <option value="left">Left</option>
          <option value="both">Both</option>
        </select>
      </Field>

      <Field dark label="Height (inches)">
        <input
          type="number"
          className={darkInputClass}
          value={value.height_in}
          min={1}
          onChange={(e) => set("height_in", Number(e.target.value))}
        />
      </Field>

      <Field dark label="Weight (lb)">
        <input
          type="number"
          className={darkInputClass}
          value={value.weight_lb}
          min={1}
          onChange={(e) => set("weight_lb", Number(e.target.value))}
        />
      </Field>

      <Field dark label="Position (optional)">
        <input
          type="text"
          className={darkInputClass}
          placeholder="e.g. Center Back"
          value={value.position ?? ""}
          onChange={(e) => set("position", e.target.value || null)}
        />
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
