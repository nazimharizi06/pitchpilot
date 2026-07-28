import { z } from "zod";

export const profileSchema = z.object({
  account_type: z.enum(["parent", "player"]),
  age: z.coerce.number().int().min(5, "Age must be 5 or older").max(100, "Enter a valid age"),
  height_in: z.coerce.number().positive("Enter a valid height"),
  weight_lb: z.coerce.number().positive("Enter a valid weight"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  dominant_foot: z.enum(["left", "right", "both"]),
  position: z.string().trim().min(1).nullable(),
  playing_level: z.enum(["beginner", "intermediate", "advanced"]),
  injury_notes: z.string().trim().max(1000).nullable(),
});

const goalsFields = {
  goals: z
    .array(z.enum(["ball_control", "dribbling", "passing", "shooting", "speed_agility", "endurance", "weak_foot"]))
    .min(1, "Pick at least one goal"),
  self_ratings: z.record(z.string(), z.enum(["beginner", "intermediate", "advanced"])),
};

const availabilityFields = {
  days_per_week: z.coerce.number().int().min(1, "At least 1 day").max(7, "At most 7 days"),
  space_available: z.enum(["yard", "driveway", "full_field", "indoor"]),
  equipment_available: z
    .array(z.enum(["cones", "wall", "ball", "ladder", "goal", "partner", "none"]))
    .min(1, "Select what you have, or 'None'"),
};

// Per-step schemas for the wizard — validate only what that step collects,
// so e.g. picking goals doesn't fail on equipment you haven't gotten to yet.
export const goalsStepSchema = z.object(goalsFields).refine((data) => data.goals.every((g) => data.self_ratings[g]), {
  message: "Rate every goal you selected",
  path: ["self_ratings"],
});

export const availabilityStepSchema = z.object(availabilityFields);

// Full combined schema — final submit + server-side (API route) validation.
export const goalsAndAssessmentSchema = z
  .object({ ...goalsFields, ...availabilityFields })
  .refine((data) => data.goals.every((g) => data.self_ratings[g]), {
    message: "Rate every goal you selected",
    path: ["self_ratings"],
  });

// Server-side (API route) boundary schema — includes the id assigned client-side.
export const userProfileSchema = profileSchema.extend({ id: z.string().min(1) });

export const intakeDataSchema = z.object({
  profile: userProfileSchema,
  goalsAndAssessment: goalsAndAssessmentSchema,
  waiverAccepted: z.literal(true, { message: "You must acknowledge the waiver to continue" }),
});
