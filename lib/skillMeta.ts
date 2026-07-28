import { Target, Shuffle, Send, Crosshair, Wind, HeartPulse, Repeat2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SkillCategory } from "@/lib/types";

export const SKILL_ICONS: Record<SkillCategory, LucideIcon> = {
  ball_control: Target,
  dribbling: Shuffle,
  passing: Send,
  shooting: Crosshair,
  speed_agility: Wind,
  endurance: HeartPulse,
  weak_foot: Repeat2,
};

export const SKILL_BLURBS: Record<SkillCategory, string> = {
  ball_control: "First touch and close control under pressure.",
  dribbling: "1v1 moves that create separation.",
  passing: "Accuracy and power over every distance.",
  shooting: "Finishing from every angle.",
  speed_agility: "Change of direction and top-end speed.",
  endurance: "The engine to compete for 90 minutes.",
  weak_foot: "Confidence on both feet, not just one.",
};

// Each category gets its own gradient wash so grids read as tiered/varied
// without needing photography.
export const SKILL_GRADIENTS: Record<SkillCategory, string> = {
  ball_control: "from-emerald-500/25 via-emerald-500/0 to-transparent",
  dribbling: "from-sky-500/25 via-sky-500/0 to-transparent",
  passing: "from-amber-500/25 via-amber-500/0 to-transparent",
  shooting: "from-rose-500/25 via-rose-500/0 to-transparent",
  speed_agility: "from-violet-500/25 via-violet-500/0 to-transparent",
  endurance: "from-cyan-500/25 via-cyan-500/0 to-transparent",
  weak_foot: "from-lime-500/25 via-lime-500/0 to-transparent",
};

export const SKILL_ICON_COLORS: Record<SkillCategory, string> = {
  ball_control: "text-emerald-400",
  dribbling: "text-sky-400",
  passing: "text-amber-400",
  shooting: "text-rose-400",
  speed_agility: "text-violet-400",
  endurance: "text-cyan-400",
  weak_foot: "text-lime-400",
};
