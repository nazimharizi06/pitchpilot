"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUnlockedSessionCount, loadIntake, loadPlan, savePlan, unlockNextSession } from "@/lib/storage";
import type { Plan } from "@/lib/types";
import { Header } from "@/components/landing/Header";
import { WeekProgress } from "@/components/plan/WeekProgress";
import { SessionCard } from "@/components/plan/SessionCard";
import { Button } from "@/components/ui/Button";

// Delays between retries when generating from a saved-but-not-yet-generated
// intake (see generateFromSavedIntake below) — absorbs the short lag between
// a successful Stripe checkout redirect and the webhook updating subscription
// status, rather than making the user manually refresh.
const RETRY_DELAYS_MS = [1000, 2000, 3000];

export default function PlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [unlocked, setUnlocked] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Intake saves its answers before the user ever subscribes (see
  // app/intake/page.tsx), so a fresh sign-up lands here with an intake but no
  // plan yet — finish the job now that they're (hopefully) subscribed.
  async function generateFromSavedIntake() {
    const intake = loadIntake();
    if (!intake) {
      router.replace("/intake");
      return;
    }

    setGenerating(true);
    setGenerateError(null);

    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      try {
        const res = await fetch("/api/generate-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(intake),
        });

        if (res.ok) {
          const generated = (await res.json()) as Plan;
          savePlan(generated);
          setPlan(generated);
          setUnlocked(getUnlockedSessionCount());
          setGenerating(false);
          setLoaded(true);
          return;
        }

        if (res.status !== 403) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Couldn't generate your plan.");
        }
        // 403 right after checkout usually just means the Stripe webhook
        // hasn't updated subscription status yet — worth a few retries.
      } catch (err) {
        setGenerateError(err instanceof Error ? err.message : "Something went wrong");
        setGenerating(false);
        setLoaded(true);
        return;
      }

      const delay = RETRY_DELAYS_MS[attempt];
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    }

    setGenerateError("Still finishing your subscription setup. Try again in a moment.");
    setGenerating(false);
    setLoaded(true);
  }

  useEffect(() => {
    const stored = loadPlan();
    if (stored) {
      // Hydrating from localStorage, which doesn't exist during SSR — this
      // has to run as a mount effect, not a lazy useState initializer.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlan(stored);
      setUnlocked(getUnlockedSessionCount());
      setLoaded(true);
      return;
    }
    generateFromSavedIntake();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (generating) {
    return (
      <>
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-12">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Finishing your subscription and building your plan...</p>
        </main>
      </>
    );
  }

  if (generateError) {
    return (
      <>
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-12">
          <p className="text-sm text-red-600 dark:text-red-400 mb-4" role="alert">
            {generateError}
          </p>
          <div className="flex gap-3">
            <Button onClick={generateFromSavedIntake}>Try again</Button>
            <Button variant="secondary" onClick={() => window.location.assign("/#pricing")}>
              View plans
            </Button>
          </div>
        </main>
      </>
    );
  }

  if (!loaded || !plan) {
    return (
      <>
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-12">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading your plan...</p>
        </main>
      </>
    );
  }

  const visibleSessions = plan.sessions.slice(0, unlocked);

  function handleUnlockNext() {
    unlockNextSession(plan!.sessions.length);
    setUnlocked(getUnlockedSessionCount());
  }

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-baseline justify-between mb-1">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Your training plan</h1>
          <Button variant="ghost" onClick={() => router.push("/intake")}>
            Retake intake
          </Button>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Sessions unlock one at a time as you complete them.
        </p>

        <WeekProgress total={plan.sessions.length} unlocked={unlocked} />

        <div className="flex flex-col gap-6">
          {visibleSessions.map((session, i) => (
            <SessionCard
              key={session.day}
              session={session}
              isLastUnlocked={i === visibleSessions.length - 1}
              hasMore={unlocked < plan.sessions.length}
              onUnlockNext={handleUnlockNext}
            />
          ))}
        </div>

        {unlocked >= plan.sessions.length && (
          <p className="mt-6 text-sm text-center text-zinc-500 dark:text-zinc-400">
            That&apos;s the full week! Come back after training to re-check your goals for next week.
          </p>
        )}
      </main>
    </>
  );
}
