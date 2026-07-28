"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/landing/Header";
import { StepIndicator } from "@/components/intake/StepIndicator";
import { ProfileStep, type ProfileForm } from "@/components/intake/ProfileStep";
import { GoalsStep } from "@/components/intake/GoalsStep";
import { AvailabilityStep } from "@/components/intake/AvailabilityStep";
import { SafetyStep } from "@/components/intake/SafetyStep";
import { Button } from "@/components/ui/Button";
import { profileSchema, goalsStepSchema, availabilityStepSchema } from "@/lib/validation";
import { saveIntake, clearAll } from "@/lib/storage";
import type { GoalsAndAssessment, IntakeData } from "@/lib/types";

const STEPS = ["Profile", "Goals", "Availability", "Safety"];

const initialProfile: ProfileForm = {
  account_type: "player",
  age: 12,
  height_in: 60,
  weight_lb: 100,
  gender: "prefer_not_to_say",
  dominant_foot: "right",
  position: null,
  playing_level: "beginner",
  injury_notes: null,
};

const initialGoals: GoalsAndAssessment = {
  goals: [],
  self_ratings: {},
  days_per_week: 3,
  space_available: "yard",
  equipment_available: [],
};

export default function IntakePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ProfileForm>(initialProfile);
  const [goalsAndAssessment, setGoalsAndAssessment] = useState<GoalsAndAssessment>(initialGoals);
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function goNext() {
    setError(null);
    if (step === 0) {
      const result = profileSchema.safeParse(profile);
      if (!result.success) return setError(result.error.issues[0]?.message ?? "Check your profile info");
    }
    if (step === 1) {
      const result = goalsStepSchema.safeParse(goalsAndAssessment);
      if (!result.success) return setError(result.error.issues[0]?.message ?? "Check your goals");
    }
    if (step === 2) {
      const result = availabilityStepSchema.safeParse(goalsAndAssessment);
      if (!result.success) return setError(result.error.issues[0]?.message ?? "Check your availability");
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    setError(null);
    if (!waiverAccepted) {
      setError("You must acknowledge the waiver to continue");
      return;
    }

    const intake: IntakeData = {
      profile: { id: crypto.randomUUID(), ...profile },
      goalsAndAssessment,
      waiverAccepted,
    };

    // Save now (not just on success) so /plan can pick this up and finish
    // the job once the user signs up — see the not-signed-in/not-Pro branches below.
    saveIntake(intake);

    setSubmitting(true);
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intake),
      });

      if (res.status === 401) {
        window.location.assign("/login?next=/%23pricing");
        return;
      }
      if (res.status === 403) {
        window.location.assign("/#pricing");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Couldn't generate your plan. Please try again.");
      }
      // The server persisted the plan directly (see /api/generate-plan) — the
      // localStorage staging copy from above is no longer needed.
      clearAll();
      router.push("/plan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Build your training plan</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">A few questions, then your first week is ready.</p>

        <StepIndicator steps={STEPS} current={step} />

        {step === 0 && <ProfileStep value={profile} onChange={setProfile} />}
        {step === 1 && <GoalsStep value={goalsAndAssessment} onChange={(next) => setGoalsAndAssessment({ ...goalsAndAssessment, ...next })} />}
        {step === 2 && (
          <AvailabilityStep
            value={goalsAndAssessment}
            onChange={(next) => setGoalsAndAssessment({ ...goalsAndAssessment, ...next })}
          />
        )}
        {step === 3 && (
          <SafetyStep
            injuryNotes={profile.injury_notes}
            onInjuryNotesChange={(val) => setProfile({ ...profile, injury_notes: val })}
            waiverAccepted={waiverAccepted}
            onWaiverChange={setWaiverAccepted}
          />
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        <div className="mt-8 flex justify-between">
          <Button variant="secondary" onClick={goBack} disabled={step === 0 || submitting}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={goNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Building your plan..." : "Generate my plan"}
            </Button>
          )}
        </div>
      </main>
    </>
  );
}
