"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUnlockedSessionCount, loadPlan, unlockNextSession } from "@/lib/storage";
import type { Plan } from "@/lib/types";
import { Header } from "@/components/landing/Header";
import { WeekProgress } from "@/components/plan/WeekProgress";
import { SessionCard } from "@/components/plan/SessionCard";
import { Button } from "@/components/ui/Button";

export default function PlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [unlocked, setUnlocked] = useState(1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = loadPlan();
    if (!stored) {
      router.replace("/intake");
      return;
    }
    // Hydrating from localStorage, which doesn't exist during SSR — this has
    // to run as a mount effect, not a lazy useState initializer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlan(stored);
    setUnlocked(getUnlockedSessionCount());
    setLoaded(true);
  }, [router]);

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
