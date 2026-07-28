"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Flame, Target, Clock, ListChecks } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loadIntake, clearAll } from "@/lib/storage";
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
import type { Drill, PlanDrillEntry } from "@/lib/types";

// Delays between retries when generating from a saved-but-not-yet-generated
// intake — absorbs the short lag between a successful Stripe checkout
// redirect and the webhook updating subscription status.
const RETRY_DELAYS_MS = [1000, 2000, 3000];

export default function MyPlanPage() {
  const router = useRouter();
  const [state, setState] = useState<PlanState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  async function fetchState() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login?next=/plan");
      return null;
    }
    const loadedState = await loadPlanState(supabase, user.id);
    return { supabase, user, loadedState };
  }

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
          clearAll();
          const result = await fetchState();
          if (result?.loadedState) {
            setState(result.loadedState);
            setGenerating(false);
            setLoaded(true);
            return;
          }
        } else if (res.status !== 403) {
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
    (async () => {
      const result = await fetchState();
      if (!result) return;
      if (result.loadedState) {
        setState(result.loadedState);
        setLoaded(true);
        return;
      }
      await generateFromSavedIntake();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggleDrill(day: number, drillId: string) {
    if (!state) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const nextIds = await toggleDrillComplete(supabase, user.id, day, drillId, state.progress);
    setState({
      ...state,
      progress: state.progress.map((p) => (p.day === day ? { ...p, completed_drill_ids: nextIds } : p)),
    });
  }

  async function handleCompleteSession(day: number) {
    if (!state) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await markSessionComplete(supabase, user.id, day);
    const nowIso = new Date().toISOString();
    setState({
      ...state,
      progress: state.progress.map((p) => (p.day === day ? { ...p, completed_at: nowIso } : p)),
    });
  }

  if (generating) {
    return <StatusMessage>Finishing your subscription and building your plan...</StatusMessage>;
  }

  if (generateError) {
    return (
      <div className="max-w-2xl px-6 py-12">
        <p className="text-sm text-red-400 mb-4" role="alert">
          {generateError}
        </p>
        <div className="flex gap-3">
          <Button onClick={generateFromSavedIntake}>Try again</Button>
          <Button variant="outlineDark" onClick={() => window.location.assign("/#pricing")}>
            View plans
          </Button>
        </div>
      </div>
    );
  }

  if (!loaded || !state) {
    return <StatusMessage>Loading your plan...</StatusMessage>;
  }

  const { plan, progress } = state;
  const stats = computeStats(plan.sessions, progress);
  const activeDay = plan.sessions.find((s) => !progress.find((p) => p.day === s.day)?.completed_at);
  const unlockedCount = 1 + progress.filter((p) => p.completed_at).length;

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
          <span className="font-semibold text-emerald-400">WEEK PROGRESS</span>
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
        <StatCard icon={CalendarDays} value={stats.sessionsCompleted} label="Sessions this week" />
        <StatCard icon={Target} value={`${stats.completionPct}%`} label="Plan completion" />
        <StatCard icon={Clock} value={stats.totalMinutes} label="Total minutes" iconClassName="bg-sky-950/60 text-sky-400" />
        <StatCard icon={ListChecks} value={stats.drillsCompleted} label="Drills completed" />
      </div>

      <h2 className="text-lg font-semibold text-white mb-4">Your training plan</h2>
      <div className="flex flex-col gap-3">
        {plan.sessions.map((session) => {
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
              <p className="text-sm text-zinc-400 mb-5">{session.explanation}</p>
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

      {!activeDay && (
        <p className="mt-6 text-sm text-center text-zinc-400">
          That&apos;s the full week! Come back after training to re-check your goals for next week.
        </p>
      )}
    </div>
  );
}

function StatusMessage({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-12 text-sm text-zinc-400">{children}</div>;
}
