// STUB — not implemented. Wire this up once there's a real ANTHROPIC_API_KEY.
//
// This should implement the same `AIProvider` interface as mockProvider.ts
// (see lib/ai/provider.ts) so swapping it in is a one-line change wherever
// generatePlan.ts picks a provider — no other file should need to change.
//
// Rough shape once implemented:
//   import Anthropic from "@anthropic-ai/sdk";
//   const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
//   - weightGoals / pickDrills / explainSession would send the candidate
//     drills + user profile as structured input and ask Claude to return
//     a structured decision (tool use / JSON mode), replacing the mock's
//     fixed heuristics with real judgment — including the doc's open
//     AI-judgment questions (how gender factors in, whether to repeat
//     drills within a week, etc).
//
// See README.md "Swapping in real services" for the full checklist.

import type { AIProvider } from "@/lib/ai/provider";

export const claudeProvider: AIProvider = {
  weightGoals() {
    throw new Error("claudeProvider is not implemented yet — see lib/ai/claudeProvider.ts");
  },
  pickDrills() {
    throw new Error("claudeProvider is not implemented yet — see lib/ai/claudeProvider.ts");
  },
  explainSession() {
    throw new Error("claudeProvider is not implemented yet — see lib/ai/claudeProvider.ts");
  },
  summarizeWeighting() {
    throw new Error("claudeProvider is not implemented yet — see lib/ai/claudeProvider.ts");
  },
};
