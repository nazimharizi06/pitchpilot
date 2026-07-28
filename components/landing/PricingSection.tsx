"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PhoneNumberModal } from "@/components/landing/PhoneNumberModal";
import type { SubscriptionTier } from "@/lib/subscriptions";

const TIERS: {
  id: SubscriptionTier;
  name: string;
  price: string;
  popular: boolean;
  features: string[];
}[] = [
  {
    id: "base",
    name: "Base",
    price: "$10",
    popular: false,
    features: ["Browse the full drill library", "Filter by skill, level, equipment, and space"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$20",
    popular: true,
    features: [
      "Everything in Base",
      "AI-generated weekly training plans",
      "Richer AI explanations for every session",
      "Manual re-check & level-ups",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$50",
    popular: false,
    features: ["Everything in Pro", "Drill demonstration videos"],
  },
];

export function PricingSection() {
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phonePromptTier, setPhonePromptTier] = useState<SubscriptionTier | null>(null);

  async function startCheckout(tier: SubscriptionTier, phone?: string) {
    setError(null);
    setLoadingTier(tier);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, phone }),
      });
      if (res.status === 401) {
        window.location.assign("/login?next=/%23pricing");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body.error === "phone_required") {
          setPhonePromptTier(tier);
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
    if (!phonePromptTier) return;
    const tier = phonePromptTier;
    setPhonePromptTier(null);
    startCheckout(tier, phone);
  }

  return (
    <section id="pricing" className="bg-zinc-950 px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-emerald-400 mb-2">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
            Start free. Stay if it&apos;s working.
          </h2>
          <p className="text-zinc-400">7-day free trial on every plan. Cancel anytime going forward.</p>
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
              <p className="text-3xl font-semibold text-white mb-5">
                {tier.price}
                <span className="text-sm font-normal text-zinc-400">/mo</span>
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
                onClick={() => startCheckout(tier.id)}
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
        <p className="text-xs text-zinc-500 mt-8 text-center">No refunds. Cancel anytime going forward.</p>
      </div>
      {phonePromptTier && (
        <PhoneNumberModal
          submitting={loadingTier === phonePromptTier}
          onSubmit={handlePhoneSubmit}
          onCancel={() => setPhonePromptTier(null)}
        />
      )}
    </section>
  );
}
