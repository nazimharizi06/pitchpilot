"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Repeat2, ShieldCheck } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { StepIndicator } from "@/components/intake/StepIndicator";
import { TipCard } from "@/components/intake/TipCard";
import { ProfileStep, type ProfileForm } from "@/components/intake/ProfileStep";
import { GoalsStep } from "@/components/intake/GoalsStep";
import { AvailabilityStep } from "@/components/intake/AvailabilityStep";
import { SafetyStep } from "@/components/intake/SafetyStep";
import { Button } from "@/components/ui/Button";
import { profileSchema, goalsStepSchema, availabilityStepSchema } from "@/lib/validation";
import { saveIntake, clearAll } from "@/lib/storage";
import type { GoalsAndAssessment, IntakeData } from "@/lib/types";

const STEPS = ["Profile", "Goals", "Availability", "Safety"];

const STEP_COPY = [
  { title: "Let's get to know you", subtitle: "This helps us personalize your plan." },
  { title: "What do you want to focus on?", subtitle: "Pick everything you want to work on — we'll build your week around it." },
  { title: "When can you train?", subtitle: "We'll build your plan around your schedule." },
  { title: "Anything we should know?", subtitle: "Help us keep you safe." },
];

const TIPS = [
  { icon: Sparkles, title: "100% Personalized", body: "Every answer here shapes the plan you get." },
  null,
  { icon: Repeat2, title: "Consistency beats intensity", body: "Showing up 3x a week beats doing too much and burning out." },
  { icon: ShieldCheck, title: "Your safety comes first", body: "We build around any limits you share, and you can update this anytime." },
];

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
  const [guardianName, setGuardianName] = useState<string | null>(null);
  const [guardianEmail, setGuardianEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isMinorPlayer = profile.account_type === "player" && profile.age < 18;

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
    if (isMinorPlayer && !guardianName?.trim()) {
      setError("A parent or guardian must enter their name to accept the waiver for a player under 18");
      return;
    }
    if (isMinorPlayer && !guardianEmail?.trim()) {
      setError("A parent or guardian email is required to send the confirmation for a player under 18");
      return;
    }
    if (!waiverAccepted) {
      setError("You must acknowledge the waiver to continue");
      return;
    }

    const intake: IntakeData = {
      profile: { id: crypto.randomUUID(), ...profile },
      goalsAndAssessment,
      waiverAccepted,
      guardianName,
      guardianEmail,
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

  const copy = STEP_COPY[step];
  const tip = TIPS[step];

  const stepContent = (
    <>
      {step === 0 && <ProfileStep value={profile} onChange={setProfile} />}
      {step === 1 && (
        <GoalsStep value={goalsAndAssessment} onChange={(next) => setGoalsAndAssessment({ ...goalsAndAssessment, ...next })} />
      )}
      {step === 2 && (
        <AvailabilityStep
          value={goalsAndAssessment}
          onChange={(next) => setGoalsAndAssessment({ ...goalsAndAssessment, ...next })}
        />
      )}
      {step === 3 && (
        <SafetyStep
          accountType={profile.account_type}
          age={profile.age}
          injuryNotes={profile.injury_notes}
          onInjuryNotesChange={(val) => setProfile({ ...profile, injury_notes: val })}
          guardianName={guardianName}
          onGuardianNameChange={setGuardianName}
          guardianEmail={guardianEmail}
          onGuardianEmailChange={setGuardianEmail}
          waiverAccepted={waiverAccepted}
          onWaiverChange={setWaiverAccepted}
        />
      )}
    </>
  );

  return (
    <>
      <Header dark />
      <main className="relative bg-zinc-950 min-h-screen overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-dot-grid text-white/[0.03]" />
        <div
          aria-hidden
          className="absolute -top-40 left-1/2 -translate-x-1/2 h-[30rem] w-[50rem] rounded-full bg-emerald-500/10 blur-3xl"
        />
        <div className="relative max-w-5xl mx-auto px-6 py-16">
          <div className="max-w-xs mx-auto mb-10">
            <StepIndicator steps={STEPS} current={step} />
          </div>

          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-wide text-emerald-400 mb-2">
              STEP {step + 1} OF {STEPS.length}
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-2">{copy.title}</h1>
            <p className="text-sm text-zinc-400">{copy.subtitle}</p>
          </div>

          <div className={tip ? "max-w-3xl mx-auto" : "max-w-4xl mx-auto"}>
            {tip ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">{stepContent}</div>
                <TipCard icon={tip.icon} title={tip.title} body={tip.body} />
              </div>
            ) : (
              <div>{stepContent}</div>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-400 text-center" role="alert">
                {error}
              </p>
            )}

            <div className="mt-10 flex justify-between gap-3">
              <Button variant="outlineDark" onClick={goBack} disabled={step === 0 || submitting}>
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={goNext}>Next</Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting
                    ? isMinorPlayer
                      ? "Sending..."
                      : "Building your plan..."
                    : isMinorPlayer
                      ? "Send for guardian confirmation"
                      : "Generate my plan"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
