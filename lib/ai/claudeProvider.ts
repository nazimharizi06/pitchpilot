import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { AIProvider, ExplainSessionInput } from "@/lib/ai/provider";
import { pickDrillsByUsage, summarizeGoalWeighting } from "@/lib/ai/heuristics";

// Real AI-judgment implementation of the AIProvider interface (lib/ai/provider.ts).
// Only weightGoals and explainSession call the model — those are the two jobs
// that need actual judgment (balancing goals against each other, writing a
// natural-language explanation). pickDrills and summarizeWeighting are
// deterministic bookkeeping (anti-repetition, restating already-decided
// weights) shared with mockProvider via lib/ai/heuristics.ts.

const MODEL = "claude-opus-5";

// Constructed lazily so importing this module doesn't require an API key —
// route.ts only calls these methods when ANTHROPIC_API_KEY is actually set.
let _client: Anthropic | null = null;
function getClient(): Anthropic {
  return (_client ??= new Anthropic());
}

const weightedGoalsSchema = z.object({
  weights: z.array(
    z.object({
      goal: z.enum([
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
      ]),
      weight: z.number().int().min(1).max(3),
    })
  ),
});

export const claudeProvider: AIProvider = {
  async weightGoals(goals, selfRatings) {
    const response = await getClient().messages.parse({
      model: MODEL,
      max_tokens: 1024,
      thinking: { type: "disabled" },
      output_config: { effort: "low", format: zodOutputFormat(weightedGoalsSchema) },
      system:
        "You are a youth soccer coach's assistant balancing a training week across a player's goals. " +
        "For each goal, assign a weekly emphasis weight of 1-3: weight 3 for goals rated beginner " +
        "(they need the most attention), weight 2 for intermediate, weight 1 for advanced. " +
        "Return every goal from the input exactly once.",
      messages: [
        {
          role: "user",
          content: JSON.stringify({ goals, self_ratings: selfRatings }),
        },
      ],
    });

    const weights = response.parsed_output?.weights;
    if (!weights) throw new Error("Claude did not return a valid goal-weighting response");

    return [...weights].sort((a, b) => b.weight - a.weight);
  },

  async pickDrills(candidates, usedCounts, count) {
    return pickDrillsByUsage(candidates, usedCounts, count);
  },

  async explainSession({ themeLabel, level, drills, profile, blendedThemeLabels, positionEmphasis }: ExplainSessionInput) {
    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: 400,
      thinking: { type: "disabled" },
      output_config: { effort: "low" },
      system:
        "You are a youth soccer coach writing a short, encouraging note introducing today's training " +
        "session to a player. Two to three sentences. Mention the session's theme and reference the " +
        "specific drills by name. If position_emphasis is true, briefly note why today's theme matters " +
        "for the player's position — one clause, not a lecture. If it's false, don't mention position at " +
        "all. Plain text only, no markdown.",
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            theme: themeLabel,
            goal_level: level,
            player_playing_level: profile.playing_level,
            position: profile.position,
            position_emphasis: positionEmphasis,
            drills: drills.map((d) => d.name),
            blended_with: blendedThemeLabels,
          }),
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("Claude did not return an explanation");
    return textBlock.text;
  },

  async summarizeWeighting(weighted) {
    return summarizeGoalWeighting(weighted);
  },
};
