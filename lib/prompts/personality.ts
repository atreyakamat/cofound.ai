/**
 * DECISION PERSONALITY LAYER
 *
 * The AI adapts its questioning and analysis style to the founder's
 * decision-making personality, inferred from their profile and past decisions.
 */

export type FounderPersonality =
  | "aggressive_builder"   // bias toward action, fast decisions, high risk tolerance
  | "cautious_planner"     // thorough analysis, risk mitigation, slower execution
  | "visionary"            // long time horizon, pattern matching, big picture
  | "operator"             // execution-focused, metrics-driven, process-oriented
  | "unknown";             // default, no data yet

export interface PersonalityProfile {
  type: FounderPersonality;
  riskTolerance: "low" | "medium" | "high";
  decisionSpeed: "fast" | "measured" | "slow";
  analyticalDepth: "surface" | "moderate" | "deep";
}

export const PERSONALITY_PROMPTS: Record<FounderPersonality, string> = {
  aggressive_builder: `This founder moves fast and has a high risk tolerance.
Adapt your approach:
- Challenge SPEED over QUALITY tradeoffs directly.
- Push back on under-analyzed decisions.
- Highlight risks they are likely minimising.
- Don't add friction for straightforward calls.
- Match their pace — be direct, not exhaustive.`,

  cautious_planner: `This founder is thorough and risk-averse.
Adapt your approach:
- Acknowledge their analysis.
- Actively challenge OVER-CAUTION and paralysis.
- Surface opportunity costs of waiting.
- Identify when "more data" is avoidance.
- Encourage setting decision deadlines.`,

  visionary: `This founder thinks in large patterns and long timeframes.
Adapt your approach:
- Bridge vision to near-term execution concretely.
- Ask about the next 90 days, not just the 5-year arc.
- Surface operational reality that may contradict the vision.
- Ask who on the current team can execute the vision.`,

  operator: `This founder is metrics-driven and execution-focused.
Adapt your approach:
- Ground analysis in their actual numbers.
- Identify which metrics most directly test their assumption.
- Challenge decisions that lack measurable success criteria.
- Validate that operational complexity is accounted for.`,

  unknown: `No personality profile established yet.
Use a balanced default approach:
- Ask clarifying questions before advising.
- Surface the decision type and stakes.
- Do not assume risk tolerance.`,
};

/**
 * Infer personality from decision history signals.
 * Called server-side before composing any prompt.
 */
export function inferPersonality(signals: {
  avgOutcomeRating?: number;       // 1–5, did fast decisions score better?
  avgDecisionsPerMonth?: number;   // high = aggressive
  avgMessagesBeforeDecision?: number; // high = cautious
  selfDeclaredStyle?: string;
}): PersonalityProfile {
  const { selfDeclaredStyle, avgDecisionsPerMonth, avgMessagesBeforeDecision } = signals;

  if (selfDeclaredStyle) {
    const map: Record<string, FounderPersonality> = {
      aggressive_builder: "aggressive_builder",
      cautious_planner: "cautious_planner",
      visionary: "visionary",
      operator: "operator",
    };
    if (map[selfDeclaredStyle]) {
      return buildProfile(map[selfDeclaredStyle]);
    }
  }

  if ((avgDecisionsPerMonth ?? 0) > 8 && (avgMessagesBeforeDecision ?? 10) < 5) {
    return buildProfile("aggressive_builder");
  }
  if ((avgMessagesBeforeDecision ?? 0) > 12) {
    return buildProfile("cautious_planner");
  }

  return buildProfile("unknown");
}

function buildProfile(type: FounderPersonality): PersonalityProfile {
  const profiles: Record<FounderPersonality, PersonalityProfile> = {
    aggressive_builder: { type, riskTolerance: "high", decisionSpeed: "fast", analyticalDepth: "surface" },
    cautious_planner:   { type, riskTolerance: "low",  decisionSpeed: "slow", analyticalDepth: "deep" },
    visionary:          { type, riskTolerance: "medium", decisionSpeed: "measured", analyticalDepth: "moderate" },
    operator:           { type, riskTolerance: "medium", decisionSpeed: "measured", analyticalDepth: "deep" },
    unknown:            { type, riskTolerance: "medium", decisionSpeed: "measured", analyticalDepth: "moderate" },
  };
  return profiles[type];
}
