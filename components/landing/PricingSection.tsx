"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PhoneNumberModal } from "@/components/landing/PhoneNumberModal";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import type { SubscriptionTier } from "@/lib/subscriptions";

type BillingInterval = "monthly" | "annual";

const TIERS: {
  id: SubscriptionTier;
  name: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  annualBilledPrice: number;
  popular: boolean;
  features: string[];
}[] = [
  {
    id: "base",
    name: "Base",
    monthlyPrice: 10,
    annualMonthlyPrice: 8,
    annualBilledPrice: 96,
    popular: false,
    features: ["Browse the full drill library", "Filter by skill, level, equipment, and space"],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 20,
    annualMonthlyPrice: 16,
    annualBilledPrice: 192,
    popular: true,
    features: [
      "Everything in Base",
      "AI-generated 3-week training program",
      "Richer AI explanations for every session",
      "Retake your intake once you finish your 3 weeks",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    monthlyPrice: 50,
    annualMonthlyPrice: 40,
    annualBilledPrice: 480,
    popular: false,
    features: [
      "Everything in Pro",
      "Retake intake anytime, even mid-program",
      "Priority support",
      "Drill demonstration videos (coming soon)",
    ],
  },
];

export function PricingSection() {
  const [interval, setBillingInterval] = useState<BillingInterval>("monthly");
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phonePrompt, setPhonePrompt] = useState<{ tier: SubscriptionTier; interval: BillingInterval } | null>(null);

  async function startCheckout(tier: SubscriptionTier, billingInterval: BillingInterval, phone?: string) {
    setError(null);
    if (!phone) track("start_trial_click", { location: "pricing", tier, interval: billingInterval });
    setLoadingTier(tier);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, interval: billingInterval, phone }),
      });
      if (res.status === 401) {
        window.location.assign("/login?next=/%23pricing");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body.error === "phone_required") {
          setPhonePrompt({ tier, interval: billingInterval });
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

  function handlePhoneSubmit(phone: string) {
    if (!phonePrompt) return;
    const { tier, interval: billingInterval } = phonePrompt;
    setPhonePrompt(null);
    startCheckout(tier, billingInterval, phone);
  }

  return (
    <section id="pricing" className="bg-zinc-950 px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-emerald-400 mb-2">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
            Start free. Stay if it&apos;s working.
          </h2>
          <p className="text-zinc-400 mb-8">7 days free. Cancel before the trial ends and you won&apos;t be charged.</p>

          <div className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/60 p-1">
            <button
              type="button"
              onClick={() => setBillingInterval("monthly")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                interval === "monthly" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingInterval("annual")}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                interval === "annual" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Annual
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  interval === "annual" ? "bg-emerald-950/60 text-emerald-100" : "bg-emerald-950/60 text-emerald-400"
                }`}
              >
                Save 20%
              </span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl p-6 flex flex-col bg-zinc-900/40 ${
                tier.popular
                  ? "border-2 border-emerald-500 shadow-xl shadow-emerald-950/40 sm:-translate-y-2"
                  : "border border-zinc-800"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 text-white text-xs font-semibold px-3 py-1">
                  Most popular
                </span>
              )}
              <h3 className="font-semibold text-white mb-1">{tier.name}</h3>
              <div className="mb-1 flex items-baseline gap-2">
                <p className="text-3xl font-semibold text-white">
                  ${interval === "annual" ? tier.annualMonthlyPrice : tier.monthlyPrice}
                  <span className="text-sm font-normal text-zinc-400">/mo</span>
                </p>
                {interval === "annual" && <p className="text-sm text-zinc-500 line-through">${tier.monthlyPrice}</p>}
              </div>
              <p className="text-xs text-zinc-500 mb-5">
                {interval === "annual" ? `Billed $${tier.annualBilledPrice}/year` : "Billed monthly"}
              </p>
              <ul className="flex flex-col gap-3 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={tier.popular ? "primary" : "outlineDark"}
                className="w-full"
                disabled={loadingTier !== null}
                onClick={() => startCheckout(tier.id, interval)}
              >
                {loadingTier === tier.id ? "Redirecting..." : "Start free trial"}
              </Button>
            </div>
          ))}
        </div>
        {error && (
          <p className="mt-4 text-sm text-center text-red-400" role="alert">
            {error}
          </p>
        )}
        <p className="text-xs text-zinc-500 mt-8 text-center">
          Cancel anytime. Your access continues through the end of your current billing period. Payments
          already processed are nonrefundable except where required by law.
        </p>
        <ComparisonTable />
      </div>
      {phonePrompt && (
        <PhoneNumberModal
          submitting={loadingTier === phonePrompt.tier}
          onSubmit={handlePhoneSubmit}
          onCancel={() => setPhonePrompt(null)}
        />
      )}
    </section>
  );
}
