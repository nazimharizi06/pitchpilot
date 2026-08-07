"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import { Sparkles, Repeat2, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/landing/Header";
import { StepIndicator } from "@/components/intake/StepIndicator";
import { TipCard } from "@/components/intake/TipCard";
import { ProfileStep, type ProfileForm } from "@/components/intake/ProfileStep";
import { GoalsStep } from "@/components/intake/GoalsStep";
import { AvailabilityStep } from "@/components/intake/AvailabilityStep";
import { SafetyStep } from "@/components/intake/SafetyStep";
import { Button } from "@/components/ui/Button";
import { PlanGeneratingScreen } from "@/components/dashboard/PlanGeneratingScreen";
import { profileSchema, goalsStepSchema, availabilityStepSchema } from "@/lib/validation";
import { saveIntakeDraft, loadIntakeDraft, clearIntakeDraft } from "@/lib/intakeDraft";
import type { GoalsAndAssessment, IntakeData } from "@/lib/types";

const STEPS = ["Your game", "Goals", "Setup", "Finish"];

const STEP_COPY = [
  { title: "Tell us about your game.", subtitle: "The basics — nothing that slows you down." },
  { title: "What do you want to work on?", subtitle: "Pick everything that matters to you." },
  { title: "What do you have to train with?", subtitle: "We'll only pick drills that fit." },
  { title: "Ready to build your plan", subtitle: "One last thing before we get started." },
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
  height_in: null,
  weight_lb: null,
  gender: null,
  dominant_foot: null,
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

const STEP_EVENTS = ["onboarding_profile_completed", "onboarding_goals_completed", "onboarding_setup_completed"] as const;

export default function IntakePage() {
  const router = useRouter();
  // Restored synchronously via lazy initializers (not an effect — sessionStorage
  // is available at first client render) so back/forward/refresh, and the
  // redirect through /login for anyone who wasn't signed in yet, don't lose
  // progress. Read once per mount; a fresh visitor just gets the defaults.
  const initialDraft = useState(() => loadIntakeDraft())[0];
  const [step, setStep] = useState(() => initialDraft?.step ?? 0);
  const [profile, setProfile] = useState<ProfileForm>(() => initialDraft?.profile ?? initialProfile);
  const [goalsAndAssessment, setGoalsAndAssessment] = useState<GoalsAndAssessment>(
    () => initialDraft?.goalsAndAssessment ?? initialGoals
  );
  const [waiverAccepted, setWaiverAcceptedState] = useState(() => initialDraft?.waiverAccepted ?? false);
  const [guardianName, setGuardianName] = useState<string | null>(() => initialDraft?.guardianName ?? null);
  const [guardianEmail, setGuardianEmail] = useState<string | null>(() => initialDraft?.guardianEmail ?? null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const startedTracked = useRef(false);

  const isMinorPlayer = profile.account_type === "player" && profile.age < 18;

  function setWaiverAccepted(val: boolean) {
    setWaiverAcceptedState(val);
    if (val) track("onboarding_waiver_accepted", {});
  }

  // If the restored draft was marked ready-to-submit (they'd already clicked
  // "Build My Plan" before signing in) and a session now exists, submit
  // immediately — no second click needed on return from /login or Google.
  useEffect(() => {
    if (!initialDraft?.readyToSubmit) return;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const intake: IntakeData = {
        profile: { id: crypto.randomUUID(), ...initialDraft.profile },
        goalsAndAssessment: initialDraft.goalsAndAssessment,
        waiverAccepted: initialDraft.waiverAccepted,
        guardianName: initialDraft.guardianName,
        guardianEmail: initialDraft.guardianEmail,
      };
      submitIntake(intake);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the draft whenever it changes.
  useEffect(() => {
    saveIntakeDraft({
      step,
      profile,
      goalsAndAssessment,
      waiverAccepted,
      guardianName,
      guardianEmail,
      readyToSubmit: false,
    });
    if (!startedTracked.current) {
      startedTracked.current = true;
      track("onboarding_started", {});
    }
  }, [step, profile, goalsAndAssessment, waiverAccepted, guardianName, guardianEmail]);

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
    track(STEP_EVENTS[step], {});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submitIntake(intake: IntakeData) {
    setSubmitting(true);
    setError(null);
    track("plan_generation_started", {});
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intake),
      });

      if (res.status === 401) {
        // Shouldn't happen on the auto-resume path (auth was just confirmed),
        // but a session can still expire between the check and the request.
        // Submission only ever happens from the last step, so that's always
        // the right place to resume — no risk of a stale `step` closure here.
        saveIntakeDraft({
          step: STEPS.length - 1,
          profile: intake.profile,
          goalsAndAssessment: intake.goalsAndAssessment,
          waiverAccepted: intake.waiverAccepted,
          guardianName: intake.guardianName,
          guardianEmail: intake.guardianEmail,
          readyToSubmit: true,
        });
        window.location.assign("/login?next=/intake");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Couldn't build your plan right now. Your answers are saved — try again.");
      }
      const isMinor = intake.profile.account_type === "player" && intake.profile.age < 18;
      track("intake_completed", { isMinorPlayer: isMinor });
      track("plan_generation_completed", {});
      clearIntakeDraft();
      if (isMinor) {
        // Guardian-consent path: no plan yet, nothing to reveal — /plan shows
        // the "waiting on your guardian" screen instead.
        router.push("/plan");
      } else {
        router.push("/plan?reveal=1");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Your answers are saved — try again.");
      setSubmitting(false);
    }
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

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      saveIntakeDraft({
        step,
        profile,
        goalsAndAssessment,
        waiverAccepted,
        guardianName,
        guardianEmail,
        readyToSubmit: true,
      });
      router.push("/login?next=/intake");
      return;
    }

    const intake: IntakeData = {
      profile: { id: crypto.randomUUID(), ...profile },
      goalsAndAssessment,
      waiverAccepted,
      guardianName,
      guardianEmail,
    };
    await submitIntake(intake);
  }

  // Real AI generation only happens for the non-minor path (the minor path just
  // sends a quick guardian-consent email, not a "crafting your plan" wait).
  if (submitting && !isMinorPlayer) {
    return <PlanGeneratingScreen />;
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
                      : "Building..."
                    : isMinorPlayer
                      ? "Send for guardian confirmation"
                      : "Build My Plan"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
