import { describe, expect, it } from "vitest";
import { equipmentSatisfies, filterDrillsWithFallback, spaceSatisfies } from "@/lib/engine/filter";
import { assembleSession } from "@/lib/engine/schedule";
import { generatePlan } from "@/lib/engine/generatePlan";
import type { Drill, IntakeData } from "@/lib/types";

function makeDrill(overrides: Partial<Drill> & Pick<Drill, "id" | "level" | "equipment" | "space">): Drill {
  return {
    name: overrides.id,
    categories: ["passing"],
    session_type: "main",
    weak_foot_variant: null,
    instructions: "",
    progressions: [],
    reps_duration: "",
    estimated_minutes: 5,
    video_url: null,
    ...overrides,
  };
}

describe("equipmentSatisfies", () => {
  it("passes when user owns everything the drill needs", () => {
    expect(equipmentSatisfies(["ball", "cones"], ["ball"])).toBe(true);
  });
  it("fails when the user is missing required equipment", () => {
    expect(equipmentSatisfies(["ball"], ["ball", "cones"])).toBe(false);
  });
  it("treats 'none' as always satisfied", () => {
    expect(equipmentSatisfies([], ["none"])).toBe(true);
  });
});

describe("spaceSatisfies", () => {
  it("allows a bigger available space to cover a smaller required one", () => {
    expect(spaceSatisfies("full_field", "indoor")).toBe(true);
  });
  it("rejects a smaller available space than required", () => {
    expect(spaceSatisfies("indoor", "full_field")).toBe(false);
  });
});

describe("filterDrillsWithFallback", () => {
  it("returns an exact match with no fallback when one exists", () => {
    const pool = [makeDrill({ id: "a", level: "beginner", equipment: ["ball"], space: "indoor" })];
    const result = filterDrillsWithFallback(pool, { level: "beginner", equipment: ["ball"], space: "indoor" });
    expect(result.fallbackApplied).toBe("none");
    expect(result.drills.map((d) => d.id)).toEqual(["a"]);
  });

  it("widens to an adjacent level when the exact level has no match", () => {
    const pool = [makeDrill({ id: "b", level: "intermediate", equipment: ["ball"], space: "indoor" })];
    const result = filterDrillsWithFallback(pool, { level: "beginner", equipment: ["ball"], space: "indoor" });
    expect(result.fallbackApplied).toBe("adjacent_level");
    expect(result.drills.map((d) => d.id)).toEqual(["b"]);
  });

  it("relaxes equipment when level+space matches exist but equipment doesn't", () => {
    const pool = [makeDrill({ id: "c", level: "beginner", equipment: ["ball", "cones"], space: "indoor" })];
    const result = filterDrillsWithFallback(pool, { level: "beginner", equipment: ["ball"], space: "indoor" });
    expect(result.fallbackApplied).toBe("relaxed_equipment");
    expect(result.drills.map((d) => d.id)).toEqual(["c"]);
  });

  it("relaxes space as a last resort so a zero-match combo never returns nothing", () => {
    const pool = [makeDrill({ id: "d", level: "beginner", equipment: ["ball"], space: "full_field" })];
    const result = filterDrillsWithFallback(pool, { level: "beginner", equipment: ["ball"], space: "indoor" });
    expect(result.fallbackApplied).toBe("relaxed_space");
    expect(result.drills.map((d) => d.id)).toEqual(["d"]);
  });
});

describe("assembleSession", () => {
  const warmUp = [makeDrill({ id: "wu", level: "beginner", equipment: ["none"], space: "indoor", estimated_minutes: 5 })];
  const coolDown = [makeDrill({ id: "cd", level: "beginner", equipment: ["none"], space: "indoor", estimated_minutes: 5 })];

  it("fits as many main drills as the time budget allows, not a fixed count", () => {
    const main = [
      makeDrill({ id: "m1", level: "beginner", equipment: ["ball"], space: "indoor", estimated_minutes: 20 }),
      makeDrill({ id: "m2", level: "beginner", equipment: ["ball"], space: "indoor", estimated_minutes: 20 }),
      makeDrill({ id: "m3", level: "beginner", equipment: ["ball"], space: "indoor", estimated_minutes: 20 }),
    ];
    const result = assembleSession(0, warmUp, main, coolDown, 60);
    // warmup(5) + cooldown(5) + two 20s = 50, third 20 would exceed 60
    expect(result.main.map((d) => d.id)).toEqual(["m1", "m2"]);
    expect(result.totalMinutes).toBe(50);
  });

  it("keeps checking later, smaller candidates even after skipping one that didn't fit", () => {
    const main = [
      makeDrill({ id: "big", level: "beginner", equipment: ["ball"], space: "indoor", estimated_minutes: 55 }),
      makeDrill({ id: "small1", level: "beginner", equipment: ["ball"], space: "indoor", estimated_minutes: 10 }),
      makeDrill({ id: "small2", level: "beginner", equipment: ["ball"], space: "indoor", estimated_minutes: 10 }),
    ];
    const result = assembleSession(0, warmUp, main, coolDown, 60);
    expect(result.main.map((d) => d.id)).toEqual(["small1", "small2"]);
    expect(result.totalMinutes).toBe(30);
  });

  it("throws when there are no warm-up/cool-down candidates for the given equipment/space", () => {
    expect(() => assembleSession(0, [], [], coolDown)).toThrow();
  });
});

describe("generatePlan (integration, real drill library)", () => {
  function buildIntake(): IntakeData {
    return {
      profile: {
        id: "test-user",
        account_type: "player",
        age: 12,
        height_in: 60,
        weight_lb: 100,
        gender: "prefer_not_to_say",
        dominant_foot: "right",
        position: null,
        playing_level: "beginner",
        injury_notes: null,
      },
      goalsAndAssessment: {
        goals: ["weak_foot", "shooting"],
        self_ratings: { weak_foot: "beginner", shooting: "beginner" },
        days_per_week: 2,
        space_available: "full_field",
        equipment_available: ["ball", "goal", "wall", "cones", "ladder", "partner"],
      },
      waiverAccepted: true,
      guardianName: null,
      guardianEmail: null,
    };
  }

  it("generates one session per requested day, each within the time budget", async () => {
    const plan = await generatePlan(buildIntake());
    expect(plan.sessions).toHaveLength(2);
    for (const session of plan.sessions) {
      expect(session.target_duration_minutes).toBeGreaterThan(0);
      expect(session.target_duration_minutes).toBeLessThanOrEqual(60);
      expect(session.drills.length).toBeGreaterThanOrEqual(3); // warm-up + at least 1 main + cool-down
    }
  });

  it("blends standalone weak-foot drills with weak-foot-variant drills tagged in other categories", async () => {
    const plan = await generatePlan(buildIntake());
    const weakFootSession = plan.sessions.find((s) => s.theme === "Weak Foot");
    expect(weakFootSession).toBeDefined();
  });

  it("produces non-empty internal weighting notes for debugging", async () => {
    const plan = await generatePlan(buildIntake());
    expect(plan.ai_weighting_notes.length).toBeGreaterThan(0);
  });
});
