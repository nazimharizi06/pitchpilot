import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

const TIERS = [
  {
    name: "Base",
    price: "$10",
    popular: false,
    features: ["Full intake & AI-generated plans", "Full drill library", "Manual re-check & level-ups", "Email + text reminders"],
  },
  {
    name: "Pro",
    price: "$20",
    popular: true,
    features: [
      "Everything in Base",
      "Richer AI explanations for every session",
      "Deeper progress tracking",
      "Multiple simultaneous training focuses",
    ],
  },
  {
    name: "Premium",
    price: "$50",
    popular: false,
    features: ["Everything in Pro", "Drill demonstration videos"],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="max-w-6xl mx-auto px-6 py-24 border-t border-zinc-200 dark:border-zinc-800">
      <div className="text-center mb-14">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">Pricing</p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
          Start free. Stay if it&apos;s working.
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">7-day free trial on every plan. Cancel anytime going forward.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-2xl p-6 flex flex-col ${
              tier.popular
                ? "border-2 border-emerald-500 shadow-xl shadow-emerald-600/10 sm:-translate-y-2"
                : "border border-zinc-200 dark:border-zinc-800"
            }`}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 text-white text-xs font-semibold px-3 py-1">
                Most popular
              </span>
            )}
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">{tier.name}</h3>
            <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50 mb-5">
              {tier.price}
              <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">/mo</span>
            </p>
            <ul className="flex flex-col gap-3 mb-6 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/intake">
              <Button variant={tier.popular ? "primary" : "secondary"} className="w-full">
                Start free trial
              </Button>
            </Link>
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-8 text-center">No refunds. Cancel anytime going forward.</p>
    </section>
  );
}
