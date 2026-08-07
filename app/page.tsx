import { generatePlan } from "@/lib/engine/generatePlan";
import { POSITIONS, SKILL_CATEGORIES } from "@/lib/types";
import type { IntakeData } from "@/lib/types";
import { drills } from "@/lib/data/drills";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PersonalizationSection } from "@/components/landing/PersonalizationSection";
import { GoalsGrid } from "@/components/landing/GoalsGrid";
import { SamplePlanSection } from "@/components/landing/SamplePlanSection";
import { FounderSection } from "@/components/landing/FounderSection";
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
    goals: ["shooting", "dribbling", "passing", "speed_agility", "weak_foot"],
    self_ratings: {
      shooting: "beginner",
      dribbling: "beginner",
      passing: "intermediate",
      speed_agility: "intermediate",
      weak_foot: "advanced",
    },
    days_per_week: 7,
    space_available: "full_field",
    equipment_available: ["ball", "goal", "cones", "wall", "ladder"],
  },
  waiverAccepted: true,
  guardianName: null,
  guardianEmail: null,
};

export default async function Home() {
  const demoPlan = await generatePlan(DEMO_INTAKE);
  const week1Sessions = demoPlan.sessions.filter((s) => s.week === 1);
  const weekThemes = Array.from(new Set(week1Sessions.map((s) => s.theme)));

  return (
    <>
      <Header dark />
      <main className="bg-zinc-950">
        <Hero
          previewSession={demoPlan.sessions[0]}
          weekThemes={weekThemes}
          sessionCount={week1Sessions.length}
          categoryCount={SKILL_CATEGORIES.length}
          drillCount={drills.length}
          positionCount={POSITIONS.length}
        />
        <HowItWorks previewSession={demoPlan.sessions[0]} />
        <PersonalizationSection />
        <GoalsGrid />
        <SamplePlanSection sessions={demoPlan.sessions} />
        <FounderSection />
        <PricingSection />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
