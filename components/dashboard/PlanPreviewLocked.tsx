"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import { Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PhoneNumberModal } from "@/components/landing/PhoneNumberModal";
import { PRICING_TIERS } from "@/lib/pricingTiers";
import { drillsById } from "@/lib/data/drills";
import type { Plan } from "@/lib/types";
import type { SubscriptionTier } from "@/lib/subscriptions";

// Shown on /plan when a plan exists but there's no active subscription — the
// free-preview state (a first plan is generated for any signed-in account,
// see app/api/generate-plan/route.ts) and the same view a lapsed/canceled
// subscriber sees. Demonstrates real generated content while keeping the
// full training experience behind the trial.
export function PlanPreviewLocked({ plan }: { plan: Plan }) {
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phonePrompt, setPhonePrompt] = useState<SubscriptionTier | null>(null);

  const week1 = plan.sessions.filter((s) => s.week === 1);
  const day1 = week1[0];
  const day1Drills = (day1?.drills ?? [])
    .map((entry) => drillsById[entry.drillId])
    .filter((d): d is NonNullable<typeof d> => Boolean(d));
  const teaserDrills = day1Drills.slice(0, 2);
  const remainingDrillCount = day1Drills.length - teaserDrills.length;
  const otherWeeks = Array.from(new Set(plan.sessions.map((s) => s.week))).filter((w) => w !== 1);

  async function startCheckout(tier: SubscriptionTier, phone?: string) {
    setError(null);
    if (!phone) track("start_trial_click", { location: "plan_preview", tier });
    setLoadingTier(tier);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, interval: "monthly", phone }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body.error === "phone_required") {
          setPhonePrompt(tier);
          setLoadingTier(null);
          return;
        }
        throw new Error(body.error ?? "Couldn't start checkout. Please try again.");
      }
      const { url } = (await res.json()) as { url: string };
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoadingTier(null);
    }
  }

  if (!day1) return null;

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 mb-6">
        <div aria-hidden className="absolute inset-0 bg-dot-grid text-white/[0.03]" />
        <p className="relative text-xs font-semibold tracking-wide text-emerald-400 mb-2">YOUR TRAINING PLAN</p>
        <h1 className="relative text-3xl sm:text-4xl font-semibold text-white mb-3">
          {week1.length}-day week, built around you.
        </h1>
        <p className="relative text-zinc-400 max-w-lg">
          Here&apos;s a preview of your personalized program. Start your free trial to unlock every session.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div className="lg:col-span-2 flex flex-col gap-2.5">
          <p className="text-xs font-semibold tracking-wide text-zinc-500 mb-1">THIS WEEK</p>
          {week1.map((session) => (
            <div
              key={session.day}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                session.day === day1.day ? "border-emerald-500 bg-emerald-950/20" : "border-zinc-800 bg-zinc-900/40"
              }`}
            >
              <span className="text-sm font-medium text-white">
                Day {session.day} — {session.theme}
              </span>
              <span className="text-xs text-zinc-500 whitespace-nowrap">~{session.target_duration_minutes} min</span>
            </div>
          ))}
          {otherWeeks.map((w) => (
            <div
              key={w}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/20 px-4 py-3 opacity-60"
            >
              <span className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" /> Week {w}
              </span>
              <span className="text-xs text-zinc-500">Locked</span>
            </div>
          ))}
        </div>

        <div className="lg:col-span-3 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <h3 className="text-lg font-semibold text-white">
              Day {day1.day} — {day1.theme}
            </h3>
            <span className="text-xs text-zinc-400">~{day1.target_duration_minutes} min</span>
          </div>
          {day1.explanation && <p className="text-sm text-zinc-400 mb-5">{day1.explanation}</p>}

          <div className="flex flex-col gap-2.5 mb-4">
            {teaserDrills.map((drill) => (
              <div key={drill.id} className="flex items-center gap-2.5 text-sm">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-zinc-300">{drill.name}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 px-4 py-3 flex items-center gap-2 text-sm text-zinc-500">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            {remainingDrillCount > 0
              ? `${remainingDrillCount} more drill${remainingDrillCount === 1 ? "" : "s"} today, plus every other session`
              : "The rest of your program is locked"}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-800 bg-emerald-950/10 p-6">
        <p className="text-white font-medium mb-1">Ready to start?</p>
        <p className="text-sm text-zinc-400 mb-5">
          Your plan is built. Start your 7-day free trial to unlock the full program.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRICING_TIERS.filter((t) => t.id !== "base").map((tier) => (
            <div
              key={tier.id}
              className={`rounded-2xl p-5 flex flex-col bg-zinc-900/60 ${
                tier.popular ? "border-2 border-emerald-500" : "border border-zinc-800"
              }`}
            >
              <h4 className="font-semibold text-white mb-1">{tier.name}</h4>
              <p className="text-2xl font-semibold text-white mb-3">
                ${tier.monthlyPrice}
                <span className="text-sm font-normal text-zinc-400">/mo</span>
              </p>
              <Button
                variant={tier.popular ? "primary" : "outlineDark"}
                className="w-full"
                disabled={loadingTier !== null}
                onClick={() => startCheckout(tier.id)}
              >
                {loadingTier === tier.id ? "Redirecting..." : "Start My Free Trial"}
              </Button>
            </div>
          ))}
        </div>
        {error && (
          <p className="mt-4 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>

      {phonePrompt && (
        <PhoneNumberModal
          submitting={loadingTier === phonePrompt}
          onSubmit={(phone) => startCheckout(phonePrompt, phone)}
          onCancel={() => setPhonePrompt(null)}
        />
      )}
    </div>
  );
}
