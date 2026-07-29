"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveSubscription } from "@/lib/subscriptions";
import { loadPlanState, addOrReplaceCustomSession, type PlanState } from "@/lib/planProgress";
import { drills, drillsById } from "@/lib/data/drills";
import { SKILL_CATEGORIES, SKILL_CATEGORY_LABELS } from "@/lib/types";
import type { PlanSession } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Field, darkInputClass } from "@/components/ui/Field";
import { WaiverText } from "@/components/shared/WaiverText";
import { LoadingScreen } from "@/components/dashboard/LoadingScreen";
import { WaitingForGuardianScreen } from "@/components/dashboard/WaitingForGuardianScreen";

const MAIN_DRILLS = drills.filter((d) => d.session_type === "main");
const DEFAULT_WARMUP = drills.find((d) => d.session_type === "warm_up") ?? null;
const DEFAULT_COOLDOWN = drills.find((d) => d.session_type === "cool_down") ?? null;
const DAYS = [1, 2, 3, 4, 5, 6, 7];
const GUARDIAN_POLL_INTERVAL_MS = 8000;

type Stage = "loading" | "age_gate" | "adult_waiver" | "minor_form" | "awaiting_guardian" | "ready";

export function WorkoutBuilder() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [planState, setPlanState] = useState<PlanState | null>(null);

  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [waiverChecked, setWaiverChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedDrillIds, setSelectedDrillIds] = useState<string[]>([]);
  const [sessionName, setSessionName] = useState("");

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login?next=/build");
        return;
      }
      setUserId(user.id);

      const [subscription, state] = await Promise.all([
        getActiveSubscription(supabase, user.id),
        loadPlanState(supabase, user.id),
      ]);
      setPlanState(state);

      const occupiedDays = new Set((state?.plan.sessions ?? []).map((s) => s.day));
      setSelectedDay(DAYS.find((d) => !occupiedDays.has(d)) ?? 1);

      if (subscription?.waiverAccepted) {
        setStage("ready");
        return;
      }

      const { data: guardianRow } = await supabase
        .from("guardian_verifications")
        .select("status, purpose, guardian_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (guardianRow?.purpose === "waiver_only" && guardianRow.status === "pending") {
        setGuardianName(guardianRow.guardian_name);
        setStage("awaiting_guardian");
        startPolling(user.id);
        return;
      }

      setStage("age_gate");
    })();
  }, [router]);

  function startPolling(uid: string) {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(async () => {
      const supabase = createClient();
      const subscription = await getActiveSubscription(supabase, uid);
      if (subscription?.waiverAccepted) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = null;
        setStage("ready");
      }
    }, GUARDIAN_POLL_INTERVAL_MS);
  }

  async function handleAdultAccept() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/accept-waiver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdult: true }),
      });
      if (!res.ok) throw new Error("Couldn't save. Please try again.");
      setStage("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMinorSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/accept-waiver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdult: false, guardianName, guardianEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Couldn't send. Please try again.");
      setStage("awaiting_guardian");
      if (userId) startPolling(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleDrill(id: string) {
    setSelectedDrillIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSave() {
    if (!userId) return;
    if (selectedDrillIds.length === 0) {
      setError("Pick at least one drill.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const mainEntries = selectedDrillIds.map((id) => ({
      drillId: id,
      reps_duration: drillsById[id]?.reps_duration ?? "",
    }));
    const drillEntries = [
      ...(DEFAULT_WARMUP ? [{ drillId: DEFAULT_WARMUP.id, reps_duration: DEFAULT_WARMUP.reps_duration }] : []),
      ...mainEntries,
      ...(DEFAULT_COOLDOWN ? [{ drillId: DEFAULT_COOLDOWN.id, reps_duration: DEFAULT_COOLDOWN.reps_duration }] : []),
    ];
    const totalMinutes = drillEntries.reduce((sum, entry) => sum + (drillsById[entry.drillId]?.estimated_minutes ?? 0), 0);

    const session: PlanSession = {
      day: selectedDay,
      theme: sessionName.trim() || `Day ${selectedDay} — Custom Session`,
      drills: drillEntries,
      target_duration_minutes: totalMinutes,
      explanation: "",
      source: "custom",
    };

    const supabase = createClient();
    const { error: saveError } = await addOrReplaceCustomSession(supabase, userId, planState, selectedDay, session);
    setSubmitting(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    router.push("/plan");
  }

  if (stage === "loading") {
    return <LoadingScreen message="Loading..." />;
  }

  if (stage === "awaiting_guardian") {
    return <WaitingForGuardianScreen guardianName={guardianName || null} />;
  }

  if (stage === "age_gate") {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-white mb-2">Before you build a workout</h1>
        <p className="text-sm text-zinc-400 mb-8">
          We need to confirm who&apos;s accepting our training waiver before you can build your own sessions.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => setStage("adult_waiver")}>I&apos;m 18 or older</Button>
          <Button variant="outlineDark" onClick={() => setStage("minor_form")}>
            I&apos;m under 18
          </Button>
        </div>
      </div>
    );
  }

  if (stage === "adult_waiver") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-semibold text-white mb-2">Accept the waiver</h1>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm text-zinc-300 mb-5">
          <WaiverText />
          <label className="flex items-center gap-2 font-medium text-white">
            <input
              type="checkbox"
              checked={waiverChecked}
              onChange={(e) => setWaiverChecked(e.target.checked)}
              className="h-4 w-4 accent-emerald-500 shrink-0"
            />
            I have read, understood, and agree to the waiver above.
          </label>
        </div>
        {error && (
          <p className="text-sm text-red-400 mb-4" role="alert">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <Button variant="outlineDark" onClick={() => setStage("age_gate")} disabled={submitting}>
            Back
          </Button>
          <Button disabled={!waiverChecked || submitting} onClick={handleAdultAccept}>
            {submitting ? "Saving..." : "Accept & continue"}
          </Button>
        </div>
      </div>
    );
  }

  if (stage === "minor_form") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-semibold text-white mb-2">Parent or guardian confirmation</h1>
        <p className="text-sm text-zinc-400 mb-6">
          Since you&apos;re under 18, a parent or legal guardian needs to confirm the waiver by email before you
          can build a workout.
        </p>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm text-zinc-300 mb-5">
          <WaiverText />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field dark label="Parent or guardian full name">
            <input
              type="text"
              className={darkInputClass}
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              placeholder="Full legal name"
            />
          </Field>
          <Field dark label="Parent or guardian email">
            <input
              type="email"
              className={darkInputClass}
              value={guardianEmail}
              onChange={(e) => setGuardianEmail(e.target.value)}
              placeholder="parent@example.com"
            />
          </Field>
        </div>
        {error && (
          <p className="text-sm text-red-400 mb-4" role="alert">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <Button variant="outlineDark" onClick={() => setStage("age_gate")} disabled={submitting}>
            Back
          </Button>
          <Button disabled={submitting} onClick={handleMinorSubmit}>
            {submitting ? "Sending..." : "Send for guardian confirmation"}
          </Button>
        </div>
      </div>
    );
  }

  // stage === "ready"
  const occupiedDays = new Map((planState?.plan.sessions ?? []).map((s) => [s.day, s]));
  const completedDays = new Set((planState?.progress ?? []).filter((p) => p.completed_at).map((p) => p.day));

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-white mb-1">Build your own workout</h1>
      <p className="text-sm text-zinc-400 mb-8">
        Pick drills from the library and assign them to a day — today, or planned ahead.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {SKILL_CATEGORIES.map((category) => {
            const categoryDrills = MAIN_DRILLS.filter((d) => d.categories.includes(category));
            if (categoryDrills.length === 0) return null;
            return (
              <div key={category}>
                <h2 className="text-sm font-semibold text-zinc-300 mb-3">{SKILL_CATEGORY_LABELS[category]}</h2>
                <div className="flex flex-col gap-2.5">
                  {categoryDrills.map((drill) => {
                    const picked = selectedDrillIds.includes(drill.id);
                    return (
                      <button
                        key={drill.id}
                        type="button"
                        onClick={() => toggleDrill(drill.id)}
                        className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-left transition-colors ${
                          picked
                            ? "border-emerald-500 bg-emerald-950/20"
                            : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                        }`}
                      >
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm text-white">{drill.name}</h3>
                          <p className="text-xs text-zinc-400 mt-1">{drill.instructions}</p>
                        </div>
                        <span
                          className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                            picked ? "bg-emerald-500 text-zinc-950" : "border border-zinc-700 text-transparent"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold text-white mb-4">Your session</h2>

          <Field dark label="Which day?">
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const hasSession = occupiedDays.has(day);
                const completed = completedDays.has(day);
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={completed}
                    onClick={() => setSelectedDay(day)}
                    className={`h-10 w-10 rounded-full text-sm font-semibold transition-colors ${
                      selectedDay === day
                        ? "bg-emerald-500 text-zinc-950"
                        : completed
                          ? "bg-zinc-900 text-zinc-700 cursor-not-allowed"
                          : hasSession
                            ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                            : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </Field>
          {occupiedDays.has(selectedDay) && (
            <p className="text-xs text-amber-400 mt-2">Day {selectedDay} already has a session — saving will replace it.</p>
          )}

          <div className="mt-4">
            <Field dark label="Session name (optional)">
              <input
                type="text"
                className={darkInputClass}
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder={`Day ${selectedDay} — Custom Session`}
              />
            </Field>
          </div>

          <p className="text-xs text-zinc-500 mt-4">
            {selectedDrillIds.length} drill{selectedDrillIds.length === 1 ? "" : "s"} selected, plus a warm-up
            and cool-down included automatically.
          </p>

          {error && (
            <p className="text-sm text-red-400 mt-4" role="alert">
              {error}
            </p>
          )}

          <Button className="w-full mt-5" disabled={submitting} onClick={handleSave}>
            {submitting ? "Saving..." : `Save Day ${selectedDay}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
