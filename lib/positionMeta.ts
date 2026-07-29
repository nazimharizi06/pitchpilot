import type { Position, SkillCategory } from "@/lib/types";

// Which skill categories a position naturally leans on most. Used in
// lib/engine/generatePlan.ts to nudge weighting toward these — only among
// goals the player already selected, never to add a category they didn't
// choose (see the boost logic there for why). Goalkeeper is intentionally the
// strongest/most exclusive case: every other position's list is a modest
// leaning, not a replacement for the player's own self-rated priorities.
export const POSITION_EMPHASIS: Partial<Record<Position, SkillCategory[]>> = {
  goalkeeper: ["goalkeeping"],
  center_back: ["defending", "strength", "passing"],
  full_back: ["defending", "speed_agility", "endurance"],
  defensive_midfielder: ["defending", "passing", "endurance"],
  central_midfielder: ["passing", "endurance", "ball_control"],
  attacking_midfielder: ["passing", "dribbling", "shooting"],
  winger: ["dribbling", "speed_agility", "weak_foot"],
  forward: ["shooting", "speed_agility", "strength"],
};
