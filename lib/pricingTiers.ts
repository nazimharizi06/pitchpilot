import type { SubscriptionTier } from "@/lib/subscriptions";

export interface PricingTier {
  id: SubscriptionTier;
  name: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  annualBilledPrice: number;
  popular: boolean;
  features: string[];
}

// Single source of truth for tier pricing/copy — shared by the homepage
// PricingSection and the post-generation plan-preview upsell
// (components/dashboard/PlanPreviewLocked.tsx), so the two never drift.
export const PRICING_TIERS: PricingTier[] = [
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
      "AI-generated 3-week program",
      "AI explanation for every session",
      "Retake intake once you finish",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    monthlyPrice: 50,
    annualMonthlyPrice: 40,
    annualBilledPrice: 480,
    popular: false,
    features: ["Everything in Pro", "Retake intake anytime", "Priority support", "Drill videos (coming soon)"],
  },
];
