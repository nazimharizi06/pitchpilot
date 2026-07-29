// Entities mirror the finalized schema in the planning doc.
// One deliberate addition beyond that doc: `estimated_minutes` on Drill,
// needed to budget drills against the 45-60 min session target — see README.

export type SkillCategory =
  | "ball_control"
  | "dribbling"
  | "passing"
  | "shooting"
  | "speed_agility"
  | "endurance"
  | "weak_foot"
  | "strength"
  | "defending"
  | "goalkeeping";

export const SKILL_CATEGORIES: SkillCategory[] = [
  "ball_control",
  "dribbling",
  "passing",
  "shooting",
  "speed_agility",
  "endurance",
  "weak_foot",
  "strength",
  "defending",
  "goalkeeping",
];

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  ball_control: "Ball Control / First Touch",
  dribbling: "Dribbling / 1v1 Moves",
  passing: "Passing",
  shooting: "Shooting",
  speed_agility: "Speed / Agility",
  endurance: "Endurance",
  weak_foot: "Weak Foot",
  strength: "Strength",
  defending: "Defending",
  goalkeeping: "Goalkeeping",
};

export type Level = "beginner" | "intermediate" | "advanced";

export const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

export type SessionType = "main" | "warm_up" | "cool_down";

export type Equipment = "cones" | "wall" | "ball" | "ladder" | "goal" | "partner" | "none";

export type Space = "yard" | "driveway" | "full_field" | "indoor";

export interface Drill {
  id: string;
  name: string;
  categories: SkillCategory[];
  session_type: SessionType;
  level: Level;
  weak_foot_variant: string | null;
  equipment: Equipment[];
  // Minimum space this drill needs — the ranking in lib/engine/filter.ts means any
  // larger space also qualifies, so this is really "smallest sufficient space,"
  // not an exhaustive list.
  space: Space;
  // True only for drills that specifically need natural grass (e.g. diving), not just
  // "enough room" — the space rank alone can't express "yard/full_field but not
  // driveway" since driveway outranks yard despite being a harder surface. See
  // drillSpaceSatisfies in lib/engine/filter.ts.
  grass_only?: boolean;
  instructions: string;
  progressions: string[];
  reps_duration: string;
  estimated_minutes: number;
  video_url: string | null;
  // Informational only — which positions this drill is especially relevant for.
  // Not used to hide/exclude drills from other positions (any player can still pick
  // any category as a goal); see generatePlan.ts for the one place position
  // actually affects selection (boosting Goalkeeping weight for keepers).
  positions?: Position[];
}

export type AccountType = "parent" | "player";

export type DominantFoot = "left" | "right" | "both";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export type Position =
  | "goalkeeper"
  | "center_back"
  | "full_back"
  | "defensive_midfielder"
  | "central_midfielder"
  | "attacking_midfielder"
  | "winger"
  | "forward";

export const POSITIONS: Position[] = [
  "goalkeeper",
  "center_back",
  "full_back",
  "defensive_midfielder",
  "central_midfielder",
  "attacking_midfielder",
  "winger",
  "forward",
];

export const POSITION_LABELS: Record<Position, string> = {
  goalkeeper: "Goalkeeper",
  center_back: "Center Back",
  full_back: "Full Back / Wing Back",
  defensive_midfielder: "Defensive Midfielder",
  central_midfielder: "Central Midfielder",
  attacking_midfielder: "Attacking Midfielder",
  winger: "Winger",
  forward: "Forward / Striker",
};

export interface UserProfile {
  id: string;
  account_type: AccountType;
  age: number;
  height_in: number;
  weight_lb: number;
  gender: Gender;
  dominant_foot: DominantFoot;
  position: Position | null;
  playing_level: Level;
  injury_notes: string | null;
}

export interface GoalsAndAssessment {
  goals: SkillCategory[];
  self_ratings: Partial<Record<SkillCategory, Level>>;
  days_per_week: number;
  space_available: Space;
  equipment_available: Equipment[];
}

export interface IntakeData {
  profile: UserProfile;
  goalsAndAssessment: GoalsAndAssessment;
  waiverAccepted: boolean;
  // Required when profile.account_type === "player" and profile.age is under 18 —
  // a minor can't be the one legally accepting a liability waiver, a parent/guardian
  // must (see components/intake/SafetyStep.tsx and lib/validation.ts). guardianEmail
  // is where the confirmation link is sent — see app/api/generate-plan/route.ts.
  guardianName: string | null;
  guardianEmail: string | null;
}

export interface PlanDrillEntry {
  drillId: string;
  reps_duration: string;
}

export interface PlanSession {
  day: number;
  // Groups sessions for display (Week 1/2/3...). AI plans span 3 weeks per intake
  // (lib/engine/generatePlan.ts); custom/builder sessions use a plain 7-day grouping
  // (Math.ceil(day / 7)) since Base has no days_per_week pacing concept.
  week: number;
  theme: string;
  drills: PlanDrillEntry[];
  target_duration_minutes: number;
  // AI-written justification for "ai" sessions; for "custom" sessions this is never
  // fabricated AI-style reasoning — it's blank or whatever the user typed themselves.
  explanation: string;
  source: "ai" | "custom";
}

export interface Plan {
  sessions: PlanSession[];
  ai_weighting_notes: string;
  generated_at: string;
}
