"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
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
import { LoadingScreen } from "@/components/dashboard/LoadingScreen";
import { AnonymousPlanTeaser } from "@/components/intake/AnonymousPlanTeaser";
import { SaveYourPlanPrompt } from "@/components/intake/SaveYourPlanPrompt";
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

type Teaser = { dayCount: number; focusAreas: string[] };
// "wizard": the 4-step form. "generating"/"claiming": full-screen states for
// the adult path (already-authenticated or anonymous). "teaser"/"signin":
// the anonymous pre-auth moments. Minors never enter any of these — see
// handleSubmit's isMinorPlayer branch, which is unchanged from before this
// pass and just toggles the local `submitting` flag on the wizard screen.
type Phase = "wizard" | "generating" | "teaser" | "signin" | "claiming";

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
  const [submitting, setSubmitting] = useState(false); // minor path only — see Phase note above
  const [phase, setPhase] = useState<Phase>("wizard");
  const [teaser, setTeaser] = useState<Teaser | null>(null);
  const startedTracked = useRef(false);

  const isMinorPlayer = profile.account_type === "player" && profile.age < 18;

  function setWaiverAccepted(val: boolean) {
    setWaiverAcceptedState(val);
    if (val) track("onboarding_waiver_accepted", {});
  }

  function currentIntake(): IntakeData {
    return {
      profile: { id: crypto.randomUUID(), ...profile },
      goalsAndAssessment,
      waiverAccepted,
      guardianName,
      guardianEmail,
    };
  }

  // A plan generated anonymously (before this visitor signed in) is never
  // regenerated — this only ever copies what already exists in
  // `pending_plans` onto the now-authenticated account. See
  // app/api/claim-pending-plan/route.ts.
  async function claimAndRedirect() {
    setPhase("claiming");
    setError(null);
    try {
      const res = await fetch("/api/claim-pending-plan", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body.error === "expired" || body.error === "no_pending_plan") {
          setError("Your preview expired. Let's rebuild it from your answers — nothing else to re-enter.");
          setPhase("wizard");
          setStep(STEPS.length - 1);
          return;
        }
        throw new Error(body.error ?? "Something went wrong. Please try again.");
      }
      clearIntakeDraft();
      track("intake_completed", { isMinorPlayer: false });
      router.push("/plan?reveal=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPhase(teaser ? "teaser" : "wizard");
    }
  }

  // On mount: is there a plan already generated for this browser (an
  // httpOnly cookie set by /api/generate-plan-anonymous)? The client never
  // reads the cookie itself — this just asks the server. Covers both "just
  // came back from Google" and "refreshed the plan-ready screen."
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/pending-plan-teaser");
      const data = await res.json().catch(() => ({ pending: false }));
      if (!data.pending) return;
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await claimAndRedirect();
      } else {
        setTeaser({ dayCount: data.dayCount, focusAreas: data.focusAreas });
        setPhase("teaser");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If a MINOR's draft was restored ready-to-submit (they'd already clicked
  // the button before signing in) and a session now exists, submit
  // immediately — no second click. Unchanged from the previous pass; adults
  // no longer use this path (see handleSubmit).
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
      submitIntakeAuthenticated(intake);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the draft after every change. Kept through the whole anonymous
  // flow (not cleared until claimAndRedirect succeeds) so an expired preview
  // can rebuild from it without re-asking the questionnaire.
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
    // sessionStorage (not just the ref above) so a hard refresh mid-wizard
    // doesn't re-fire this — the ref alone only survives re-renders, not a
    // real reload.
    if (!startedTracked.current && !window.sessionStorage.getItem("pitchpilot:onboarding_started_fired")) {
      startedTracked.current = true;
      window.sessionStorage.setItem("pitchpilot:onboarding_started_fired", "1");
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

  // The existing authenticated path — used for minors (after their own auth
  // check below) and for adults who are already signed in when they click
  // "Build My Plan". Unchanged behavior from the previous pass.
  async function submitIntakeAuthenticated(intake: IntakeData) {
    const isMinor = intake.profile.account_type === "player" && intake.profile.age < 18;
    if (isMinor) setSubmitting(true);
    else setPhase("generating");
    setError(null);
    track("plan_generation_started", {});
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intake),
      });

      if (res.status === 401) {
        // A session can expire between the check in handleSubmit and this
        // request. Submission only ever happens from the last step.
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
      track("intake_completed", { isMinorPlayer: isMinor });
      track("plan_generation_completed", {});
      clearIntakeDraft();
      router.push(isMinor ? "/plan" : "/plan?reveal=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Your answers are saved — try again.");
      setSubmitting(false);
      setPhase("wizard");
    }
  }

  // The new path: real generation, but no account required yet. Only
  // reachable for non-minor players — see handleSubmit.
  async function submitIntakeAnonymous(intake: IntakeData) {
    setPhase("generating");
    setError(null);
    track("plan_generation_started", {});
    try {
      const res = await fetch("/api/generate-plan-anonymous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intake),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Couldn't build your plan right now. Your answers are saved — try again.");
      }
      const data = (await res.json()) as Teaser;
      track("plan_generation_completed", {});
      // Deliberately NOT clearing the draft here — it's the fallback if the
      // pending plan expires before the visitor signs in.
      setTeaser(data);
      setPhase("teaser");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Your answers are saved — try again.");
      setPhase("wizard");
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

    const intake = currentIntake();

    if (isMinorPlayer) {
      // Unchanged: a minor's waiver needs a guardian to confirm it, which
      // needs a real account to attach to — auth still comes first here.
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        saveIntakeDraft({ step, profile, goalsAndAssessment, waiverAccepted, guardianName, guardianEmail, readyToSubmit: true });
        router.push("/login?next=/intake");
        return;
      }
      await submitIntakeAuthenticated(intake);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await submitIntakeAuthenticated(intake);
    } else {
      await submitIntakeAnonymous(intake);
    }
  }

  async function handleSeePlan() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await claimAndRedirect();
    } else {
      setPhase("signin");
    }
  }

  if (phase === "generating") return <PlanGeneratingScreen />;
  if (phase === "claiming") return <LoadingScreen message="Saving your plan..." />;
  if (phase === "teaser" && teaser) {
    return <AnonymousPlanTeaser dayCount={teaser.dayCount} focusAreas={teaser.focusAreas} onSeePlan={handleSeePlan} />;
  }
  if (phase === "signin") return <SaveYourPlanPrompt onError={setError} />;

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
                    ? "Sending..."
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
