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
  | "weak_foot";

export const SKILL_CATEGORIES: SkillCategory[] = [
  "ball_control",
  "dribbling",
  "passing",
  "shooting",
  "speed_agility",
  "endurance",
  "weak_foot",
];

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  ball_control: "Ball Control / First Touch",
  dribbling: "Dribbling / 1v1 Moves",
  passing: "Passing",
  shooting: "Shooting",
  speed_agility: "Speed / Agility",
  endurance: "Endurance",
  weak_foot: "Weak Foot",
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
  space: Space;
  instructions: string;
  progressions: string[];
  reps_duration: string;
  estimated_minutes: number;
  video_url: string | null;
}

export type AccountType = "parent" | "player";

export type DominantFoot = "left" | "right" | "both";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export interface UserProfile {
  id: string;
  account_type: AccountType;
  age: number;
  height_in: number;
  weight_lb: number;
  gender: Gender;
  dominant_foot: DominantFoot;
  position: string | null;
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
}

export interface PlanDrillEntry {
  drillId: string;
  reps_duration: string;
}

export interface PlanSession {
  day: number;
  theme: string;
  drills: PlanDrillEntry[];
  target_duration_minutes: number;
  explanation: string;
}

export interface Plan {
  sessions: PlanSession[];
  ai_weighting_notes: string;
  generated_at: string;
}
