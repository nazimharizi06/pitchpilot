"use client";

import { User } from "lucide-react";
import { POSITIONS, POSITION_LABELS } from "@/lib/types";
import type { UserProfile } from "@/lib/types";
import { Field, darkInputClass } from "@/components/ui/Field";

export type ProfileForm = Omit<UserProfile, "id">;

// Scrollable <select> lists instead of number-input spinners — easier to pick
// a value on both desktop and mobile than the tiny native up/down arrows.
const AGE_OPTIONS = Array.from({ length: 96 }, (_, i) => i + 5); // 5..100, matches profileSchema
const FEET_OPTIONS = [2, 3, 4, 5, 6, 7];
const INCHES_OPTIONS = Array.from({ length: 12 }, (_, i) => i); // 0..11 — never rolls into a whole foot
const WEIGHT_OPTIONS = Array.from({ length: 261 }, (_, i) => i + 40); // 40..300 lb

export function ProfileStep({
  value,
  onChange,
}: {
  value: ProfileForm;
  onChange: (next: ProfileForm) => void;
}) {
  const set = <K extends keyof ProfileForm>(key: K, val: ProfileForm[K]) => onChange({ ...value, [key]: val });

  const feet = Math.floor(value.height_in / 12);
  const inches = value.height_in % 12;

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

      <Field dark label="Gender">
        <div className="relative">
          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md bg-emerald-950/60 text-emerald-400 flex items-center justify-center pointer-events-none">
            <User className="h-3.5 w-3.5" />
          </span>
          <select
            className={`${darkInputClass} w-full`}
            style={{ paddingLeft: "2.25rem" }}
            value={value.gender}
            onChange={(e) => set("gender", e.target.value as ProfileForm["gender"])}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
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

      <Field dark label="Height">
        <div className="flex gap-2">
          <select
            className={`${darkInputClass} flex-1`}
            value={feet}
            onChange={(e) => set("height_in", Number(e.target.value) * 12 + inches)}
          >
            {FEET_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f} ft
              </option>
            ))}
          </select>
          <select
            className={`${darkInputClass} flex-1`}
            value={inches}
            onChange={(e) => set("height_in", feet * 12 + Number(e.target.value))}
          >
            {INCHES_OPTIONS.map((i) => (
              <option key={i} value={i}>
                {i} in
              </option>
            ))}
          </select>
        </div>
      </Field>

      <Field dark label="Weight (lb)">
        <select
          className={darkInputClass}
          value={value.weight_lb}
          onChange={(e) => set("weight_lb", Number(e.target.value))}
        >
          {WEIGHT_OPTIONS.map((w) => (
            <option key={w} value={w}>
              {w}
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
