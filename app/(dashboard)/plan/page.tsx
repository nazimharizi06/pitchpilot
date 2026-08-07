"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { CalendarDays, Flame, Target, Clock, ListChecks } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveSubscription } from "@/lib/subscriptions";
import {
  computeStats,
  isDayUnlocked,
  loadPlanState,
  markSessionComplete,
  toggleDrillComplete,
  type PlanState,
} from "@/lib/planProgress";
import { drillsById } from "@/lib/data/drills";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { DrillChecklistItem } from "@/components/dashboard/DrillChecklistItem";
import { LoadingScreen } from "@/components/dashboard/LoadingScreen";
import { WaitingForGuardianScreen } from "@/components/dashboard/WaitingForGuardianScreen";
import { PlanPreviewLocked } from "@/components/dashboard/PlanPreviewLocked";
import { PlanRevealScreen } from "@/components/dashboard/PlanRevealScreen";
import type { Drill, PlanDrillEntry } from "@/lib/types";

// Delays between retries while confirming subscription status — absorbs the short
// lag between a successful Stripe checkout redirect and the webhook updating
// subscriptions.status. Intake now happens *after* checkout on its own page (see
// app/intake/page.tsx), once the subscription is already confirmed active, so
// this page no longer needs to generate anything itself — only route.
const RETRY_DELAYS_MS = [1000, 2000, 3000];

// How often to re-check for a plan while waiting on a parent/guardian to click
// the confirmation email — unlike the webhook race above, this has no bounded
// duration, so it polls the same tab indefinitely rather than retrying a fixed
// number of times.
const GUARDIAN_POLL_INTERVAL_MS = 8000;

export default function MyPlanPage() {
  const router = useRouter();
  const [state, setState] = useState<PlanState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [awaitingGuardian, setAwaitingGuardian] = useState(false);
  const [awaitingGuardianName, setAwaitingGuardianName] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  // Lazy initializer (not an effect) — avoids the useSearchParams/Suspense
  // requirement on a page that's already entirely client-rendered, and reads
  // fine at first client render since this only affects what shows *after*
  // `loaded` becomes true (every earlier render path is a loading state).
  const [showReveal, setShowReveal] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("reveal") === "1"
  );
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  function startPolling(userId: string) {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(async () => {
      const supabase = createClient();
      const loadedState = await loadPlanState(supabase, userId);
      if (loadedState) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = null;
        setState(loadedState);
        setAwaitingGuardian(false);
      }
    }, GUARDIAN_POLL_INTERVAL_MS);
  }

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login?next=/plan");
        return;
      }

      const loadedState = await loadPlanState(supabase, user.id);
      if (loadedState) {
        let subscription = await getActiveSubscription(supabase, user.id);
        // Just back from Stripe (the locked preview's "Start My Free Trial" CTA
        // redirects here with ?checkout=success) — the webhook that activates
        // `subscriptions` can lag a beat behind the redirect, so a few retries
        // absorb that race before falling back to the locked view.
        const justCheckedOut = new URLSearchParams(window.location.search).get("checkout") === "success";
        for (let attempt = 0; justCheckedOut && !subscription && attempt < RETRY_DELAYS_MS.length; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
          subscription = await getActiveSubscription(supabase, user.id);
        }
        setHasActiveSubscription(Boolean(subscription));
        if (!subscription) track("plan_preview_viewed", {});
        setState(loadedState);
        setLoaded(true);
        return;
      }

      // No plan yet — confirm subscription status before deciding where to send
      // them (a few retries absorb the short webhook lag right after checkout).
      let subscription = await getActiveSubscription(supabase, user.id);
      for (let attempt = 0; !subscription && attempt < RETRY_DELAYS_MS.length; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
        subscription = await getActiveSubscription(supabase, user.id);
      }

      if (!subscription) {
        router.replace("/#pricing");
        return;
      }

      // Base tier never gets an AI-generated plan — the manual workout builder
      // is its only real destination. Sending it through the AI path here would
      // just 403 forever, which used to show a permanent "still finishing setup"
      // error for a case that was never actually transient.
      if (subscription.tier === "base") {
        router.replace("/build");
        return;
      }

      // Pro/Premium with no plan yet — check for a pending guardian-consent
      // request (a minor's intake was already submitted) before sending them to
      // /intake to start one.
      const { data: guardianRow } = await supabase
        .from("guardian_verifications")
        .select("status, guardian_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (guardianRow?.status === "pending") {
        setAwaitingGuardianName(guardianRow.guardian_name);
        setAwaitingGuardian(true);
        setLoaded(true);
        startPolling(user.id);
        return;
      }

      router.replace("/intake");
    })();
  }, [router]);

  async function handleToggleDrill(day: number, drillId: string) {
    if (!state) return;
    const isFirstEver = state.progress.every((p) => p.completed_drill_ids.length === 0 && !p.completed_at);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const nextIds = await toggleDrillComplete(supabase, user.id, day, drillId, state.progress);
    if (isFirstEver) track("first_session_started", {});
    setState({
      ...state,
      progress: state.progress.map((p) => (p.day === day ? { ...p, completed_drill_ids: nextIds } : p)),
    });
  }

  async function handleCompleteSession(day: number) {
    if (!state) return;
    const session = state.plan.sessions.find((s) => s.day === day);
    if (!session) return;
    const isFirstEver = state.progress.every((p) => !p.completed_at);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const allDrillIds = session.drills.map((d) => d.drillId);
    await markSessionComplete(supabase, user.id, day, allDrillIds);
    if (isFirstEver) track("first_session_completed", {});
    const nowIso = new Date().toISOString();
    setState({
      ...state,
      progress: state.progress.map((p) => (p.day === day ? { ...p, completed_at: nowIso, completed_drill_ids: allDrillIds } : p)),
    });
  }

  if (awaitingGuardian) {
    return <WaitingForGuardianScreen guardianName={awaitingGuardianName} />;
  }

  if (!loaded || !state) {
    return <LoadingScreen message="Loading your plan..." />;
  }

  if (showReveal) {
    return <PlanRevealScreen plan={state.plan} onContinue={() => setShowReveal(false)} />;
  }

  if (!hasActiveSubscription) {
    return <PlanPreviewLocked plan={state.plan} />;
  }

  const { plan, progress } = state;
  const stats = computeStats(plan.sessions, progress);
  const activeDay = plan.sessions.find((s) => !progress.find((p) => p.day === s.day)?.completed_at);
  const unlockedCount = 1 + progress.filter((p) => p.completed_at).length;

  const sessionsByWeek = new Map<number, typeof plan.sessions>();
  for (const session of plan.sessions) {
    const list = sessionsByWeek.get(session.week) ?? [];
    list.push(session);
    sessionsByWeek.set(session.week, list);
  }
  const weeks = Array.from(sessionsByWeek.keys()).sort((a, b) => a - b);

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 mb-8">
        <div aria-hidden className="absolute inset-0 bg-dot-grid text-white/[0.03]" />
        <p className="relative text-xs font-semibold tracking-wide text-emerald-400 mb-2">YOUR TRAINING PLAN</p>
        <h1 className="relative text-4xl font-semibold text-white mb-3">Your plan, your game.</h1>
        <p className="relative text-zinc-400 max-w-lg mb-6">
          Personalized sessions designed to match your level, goals, and equipment.
        </p>
        <div className="relative flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span className="font-semibold text-emerald-400">PROGRAM PROGRESS</span>
          <span>
            {stats.sessionsCompleted} of {plan.sessions.length} sessions completed
          </span>
        </div>
        <div className="relative h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${Math.min((unlockedCount / plan.sessions.length) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={Flame} value={stats.streak} label="Day streak" iconClassName="bg-orange-950/60 text-orange-400" />
        <StatCard icon={CalendarDays} value={stats.sessionsCompleted} label="Sessions completed" />
        <StatCard icon={Target} value={`${stats.completionPct}%`} label="Plan completion" />
        <StatCard icon={Clock} value={stats.totalMinutes} label="Total minutes" iconClassName="bg-sky-950/60 text-sky-400" />
        <StatCard icon={ListChecks} value={stats.drillsCompleted} label="Drills completed" />
      </div>

      {weeks.map((week) => (
        <div key={week} className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Week {week}</h2>
          <div className="flex flex-col gap-3">
            {sessionsByWeek.get(week)!.map((session) => {
              const unlocked = isDayUnlocked(session.day, progress);
              const dayProgress = progress.find((p) => p.day === session.day);
              const isActive = activeDay?.day === session.day;

              if (!unlocked) {
                return (
                  <div
                    key={session.day}
                    className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/20 px-5 py-4 opacity-60"
                  >
                    <span className="text-sm font-medium text-zinc-400">
                      Day {session.day} — {session.theme}
                    </span>
                    <span className="text-xs text-zinc-500">~{session.target_duration_minutes} min · Locked</span>
                  </div>
                );
              }

              if (!isActive) {
                return (
                  <div
                    key={session.day}
                    className="flex items-center justify-between rounded-2xl border border-emerald-900/60 bg-emerald-950/10 px-5 py-4"
                  >
                    <span className="text-sm font-medium text-white">
                      Day {session.day} — {session.theme}
                    </span>
                    <span className="text-xs text-emerald-400">Completed</span>
                  </div>
                );
              }

              const drills = session.drills
                .map((entry) => ({ entry, drill: drillsById[entry.drillId] }))
                .filter((d): d is { entry: PlanDrillEntry; drill: Drill } => Boolean(d.drill));

              return (
                <div key={session.day} className="rounded-2xl border border-emerald-800 bg-zinc-900/40 p-6">
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-white">
                      Day {session.day} — {session.theme}
                    </h3>
                    <span className="text-xs text-zinc-400">~{session.target_duration_minutes} min</span>
                  </div>
                  {session.explanation && <p className="text-sm text-zinc-400 mb-5">{session.explanation}</p>}
                  <div className="flex flex-col gap-2.5 mb-5">
                    {drills.map(({ entry, drill }) => (
                      <DrillChecklistItem
                        key={entry.drillId}
                        drill={drill}
                        repsDuration={entry.reps_duration}
                        completed={dayProgress?.completed_drill_ids.includes(entry.drillId) ?? false}
                        onToggle={() => handleToggleDrill(session.day, entry.drillId)}
                      />
                    ))}
                  </div>
                  <Button onClick={() => handleCompleteSession(session.day)}>
                    {session.day === plan.sessions.length ? "Mark complete" : "Mark complete & unlock next"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {!activeDay && (
        <div className="rounded-2xl border border-emerald-800 bg-emerald-950/10 p-6 text-center">
          {plan.sessions.some((s) => s.source === "ai") ? (
            <>
              <p className="text-white font-medium mb-1">You&apos;ve completed your 3-week program 🎉</p>
              <p className="text-sm text-zinc-400 mb-4">
                Retake your intake to realign your goals and build your next 3 weeks.
              </p>
              <Link href="/intake">
                <Button>Retake your intake</Button>
              </Link>
            </>
          ) : (
            <>
              <p className="text-white font-medium mb-1">All caught up!</p>
              <p className="text-sm text-zinc-400 mb-4">Head to Build a Workout to add more sessions.</p>
              <Link href="/build">
                <Button>Build a workout</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
