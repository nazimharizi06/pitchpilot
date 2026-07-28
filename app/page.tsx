import { generatePlan } from "@/lib/engine/generatePlan";
import type { IntakeData } from "@/lib/types";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { GoalsGrid } from "@/components/landing/GoalsGrid";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQ } from "@/components/landing/FAQ";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

// A real generated session (not a mockup screenshot) used to preview the
// product on the landing page, built from a representative sample player.
const DEMO_INTAKE: IntakeData = {
  profile: {
    id: "demo",
    account_type: "player",
    age: 11,
    height_in: 56,
    weight_lb: 85,
    gender: "prefer_not_to_say",
    dominant_foot: "right",
    position: null,
    playing_level: "intermediate",
    injury_notes: null,
  },
  goalsAndAssessment: {
    goals: ["shooting", "speed_agility"],
    self_ratings: { shooting: "beginner", speed_agility: "intermediate" },
    days_per_week: 3,
    space_available: "full_field",
    equipment_available: ["ball", "goal", "cones"],
  },
  waiverAccepted: true,
};

export default async function Home() {
  const demoPlan = await generatePlan(DEMO_INTAKE);
  const weekThemes = Array.from(new Set(demoPlan.sessions.map((s) => s.theme)));

  return (
    <>
      <Header dark />
      <main className="bg-zinc-950">
        <Hero previewSession={demoPlan.sessions[0]} weekThemes={weekThemes} />
        <HowItWorks />
        <GoalsGrid />
        <PricingSection />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
