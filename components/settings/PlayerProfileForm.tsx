"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Field, darkInputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { DominantFoot, Gender } from "@/lib/types";

const FEET_OPTIONS = [2, 3, 4, 5, 6, 7];
const INCHES_OPTIONS = Array.from({ length: 12 }, (_, i) => i);
const WEIGHT_OPTIONS = Array.from({ length: 261 }, (_, i) => i + 40); // 40..300 lb

interface ProfileRow {
  height_in: number | null;
  weight_lb: number | null;
  gender: Gender | null;
  dominant_foot: DominantFoot | null;
}

// Height/weight/gender/dominant foot aren't used by plan generation (see
// lib/engine/*), so /intake no longer asks for them — this is where they can
// optionally be filled in later. Reads/writes the separate `profiles` table
// directly (decoupled from the per-plan intake snapshot in `plans.intake`).
export function PlayerProfileForm() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow>({
    height_in: null,
    weight_lb: null,
    gender: null,
    dominant_foot: null,
  });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("height_in, weight_lb, gender, dominant_foot")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setProfile(data as ProfileRow);
      setLoaded(true);
    })();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Sign in to save your profile.");
      setSaving(false);
      return;
    }
    const { error: saveError } = await supabase
      .from("profiles")
      .upsert({ user_id: user.id, ...profile, updated_at: new Date().toISOString() });
    setSaving(false);
    if (saveError) {
      setError("Couldn't save right now. Try again.");
      return;
    }
    setSavedAt(Date.now());
  }

  const feet = profile.height_in ? Math.floor(profile.height_in / 12) : "";
  const inches = profile.height_in ? profile.height_in % 12 : "";

  if (!loaded) return null;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="text-sm font-semibold text-zinc-400 mb-1">Player profile</h2>
      <p className="text-xs text-zinc-500 mb-5">
        Optional — none of this affects your training plan, it&apos;s just for your own record.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <Field dark label="Height">
          <div className="flex gap-2">
            <select
              className={`${darkInputClass} flex-1`}
              value={feet}
              onChange={(e) => {
                const f = Number(e.target.value);
                setProfile({ ...profile, height_in: f * 12 + (typeof inches === "number" ? inches : 0) });
              }}
            >
              <option value="">–</option>
              {FEET_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f} ft
                </option>
              ))}
            </select>
            <select
              className={`${darkInputClass} flex-1`}
              value={inches}
              onChange={(e) => {
                const i = Number(e.target.value);
                setProfile({ ...profile, height_in: (typeof feet === "number" ? feet : 0) * 12 + i });
              }}
            >
              <option value="">–</option>
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
            value={profile.weight_lb ?? ""}
            onChange={(e) => setProfile({ ...profile, weight_lb: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">–</option>
            {WEIGHT_OPTIONS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </Field>

        <Field dark label="Gender">
          <select
            className={darkInputClass}
            value={profile.gender ?? ""}
            onChange={(e) => setProfile({ ...profile, gender: (e.target.value || null) as Gender | null })}
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </Field>

        <Field dark label="Dominant foot">
          <select
            className={darkInputClass}
            value={profile.dominant_foot ?? ""}
            onChange={(e) => setProfile({ ...profile, dominant_foot: (e.target.value || null) as DominantFoot | null })}
          >
            <option value="">–</option>
            <option value="right">Right</option>
            <option value="left">Left</option>
            <option value="both">Both</option>
          </select>
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
        {savedAt && !saving && <span className="text-xs text-emerald-400">Saved</span>}
      </div>
      {error && (
        <p className="text-sm text-red-400 mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
