/**
 * Tests for lib/decision-engine/analysisGenerator.ts
 * Tests both the AI-dependent generateStructuredAnalysis and the pure serialization helpers.
 */

jest.mock("@/lib/ai-client", () => ({
  chatCompletion: jest.fn(),
}));

jest.mock("@/lib/prompts", () => ({
  assembleAnalysisPrompt: jest.fn((_t: string, _c: unknown, _m: unknown[], _f: unknown) => [
    { role: "system", content: "system prompt" },
    { role: "user", content: "analysis prompt" },
  ]),
}));

import {
  generateStructuredAnalysis,
  serializeAnalysis,
  deserializeAnalysis,
} from "@/lib/decision-engine/analysisGenerator";
import type { StructuredAnalysis } from "@/lib/decision-engine/analysisGenerator";
import { chatCompletion } from "@/lib/ai-client";
import { assembleAnalysisPrompt } from "@/lib/prompts";

const mockChatCompletion = chatCompletion as jest.MockedFunction<typeof chatCompletion>;

beforeEach(() => {
  mockChatCompletion.mockReset();
});

const SAMPLE_ANALYSIS: StructuredAnalysis = {
  summary: "The founder is deciding whether to raise a Series A at a potentially dilutive valuation.",
  decision_reframe: "The real decision is: do you need capital to survive, or to accelerate?",
  key_insights: [
    "Fundraising from weakness rarely produces good terms.",
    "At your burn rate, raising now means giving up more equity than needed.",
    "The right investor at the wrong terms can be worse than no investor.",
  ],
  tradeoffs: [
    {
      doing_this: "Extends runway and enables scaling key hires",
      not_doing_this: "Preserves equity and forces revenue-driven growth discipline",
    },
  ],
  risks: [
    {
      risk: "Down round risk if metrics don't improve before next raise",
      likelihood: "Medium",
      mitigation: "Set milestone targets before accepting any term sheet",
    },
  ],
  second_order_effects: [
    "Raising now sets a valuation anchor that constrains future rounds",
    "Investor board seats may slow decision-making velocity",
  ],
  recommendation: "Do not raise unless you are below 6 months runway or have an exceptional lead with strong strategic value.",
  recommendation_reasoning: "The current market conditions and your traction make this a weak fundraising position.",
  confidence: "Medium",
  confidence_reasoning: "Missing clarity on current ARR and growth rate makes full confidence impossible.",
  next_steps: [
    "Calculate your exact runway at current burn",
    "List 3 investors who could add strategic value beyond capital",
    "Run a 90-day plan to get to a stronger fundraising position",
  ],
  reflection_question: "If you don't raise, does the business survive on its own merits?",
  detected_biases: [
    {
      bias: "Urgency bias",
      signal: "We need to close this round in the next 30 days",
      reframe: "What's actually driving the 30-day deadline — is it real or self-imposed?",
    },
  ],
};

// ─── serializeAnalysis / deserializeAnalysis (pure functions) ────────────────

describe("serializeAnalysis", () => {
  it("produces a valid JSON string", () => {
    const serialized = serializeAnalysis(SAMPLE_ANALYSIS);
    expect(() => JSON.parse(serialized)).not.toThrow();
  });

  it("round-trips through deserializeAnalysis without data loss", () => {
    const serialized = serializeAnalysis(SAMPLE_ANALYSIS);
    const deserialized = deserializeAnalysis(serialized);
    expect(deserialized).not.toBeNull();
    expect(deserialized!.recommendation).toBe(SAMPLE_ANALYSIS.recommendation);
    expect(deserialized!.key_insights).toHaveLength(3);
    expect(deserialized!.detected_biases).toHaveLength(1);
  });
});

describe("deserializeAnalysis", () => {
  it("returns null for invalid JSON", () => {
    expect(deserializeAnalysis("not json")).toBeNull();
    expect(deserializeAnalysis("{broken")).toBeNull();
  });

  it("returns null for JSON that is not a StructuredAnalysis", () => {
    expect(deserializeAnalysis(JSON.stringify({ foo: "bar" }))).toBeNull();
  });

  it("returns null for empty object", () => {
    expect(deserializeAnalysis("{}")).toBeNull();
  });

  it("handles an analysis with empty arrays gracefully", () => {
    const minimal: StructuredAnalysis = {
      ...SAMPLE_ANALYSIS,
      detected_biases: [],
      tradeoffs: [],
      second_order_effects: [],
    };
    const result = deserializeAnalysis(serializeAnalysis(minimal));
    expect(result).not.toBeNull();
    expect(result!.detected_biases).toEqual([]);
  });
});

// ─── generateStructuredAnalysis ──────────────────────────────────────────────

describe("generateStructuredAnalysis", () => {
  const context = {
    primary_goal: "Extend runway and accelerate growth",
    goal: "Extend runway and accelerate growth",
    constraints: ["8 months runway", "team of 5"],
    assumptions: ["Market will remain stable"],
    risks: ["Dilution risk", "Wrong investor fit"],
    unknowns: ["Actual investor interest"],
    alternatives: ["Bootstrap to profitability", "Revenue-based financing"],
    key_facts: ["Current ARR: $400k", "MoM growth: 12%"],
  };
  const messages = [
    { role: "user", content: "We're thinking about raising a Series A." },
    { role: "assistant", content: "What's driving the timing?" },
    { role: "user", content: "We have 8 months runway and want to hire." },
  ];

  it("returns structured analysis with all required fields", async () => {
    mockChatCompletion.mockResolvedValueOnce(JSON.stringify(SAMPLE_ANALYSIS));

    const result = await generateStructuredAnalysis(
      "Raise Series A now",
      "fundraising",
      context,
      SAMPLE_ANALYSIS.detected_biases,
      messages
    );

    expect(result.summary).toBeDefined();
    expect(result.recommendation).toBeDefined();
    expect(result.risks).toBeDefined();
    expect(result.next_steps).toBeDefined();
    expect(result.detected_biases).toBeDefined();
  });

  it("merges provided biases into the returned analysis", async () => {
    // Return analysis with empty biases from AI
    mockChatCompletion.mockResolvedValueOnce(JSON.stringify({ ...SAMPLE_ANALYSIS, detected_biases: [] }));

    const biases = [
      { bias: "Sunk cost fallacy", signal: "We've invested too much to stop", reframe: "Would you start this path today?" },
    ];

    const result = await generateStructuredAnalysis(
      "Raise Series A",
      "fundraising",
      context,
      biases,
      messages
    );

    // The function should replace AI biases with the provided ones
    expect(result.detected_biases).toHaveLength(1);
    expect(result.detected_biases[0].bias).toBe("Sunk cost fallacy");
  });

  it("throws when AI fails (caller should handle)", async () => {
    mockChatCompletion.mockRejectedValueOnce(new Error("Rate limit exceeded"));
    await expect(
      generateStructuredAnalysis("Test", "other", context, [], messages)
    ).rejects.toThrow("Analysis generation failed");
  });

  it("only uses last 12 messages for context window efficiency", async () => {
    mockChatCompletion.mockResolvedValueOnce(JSON.stringify(SAMPLE_ANALYSIS));

    const manyMessages = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `Message ${i + 1}`,
    }));

    await generateStructuredAnalysis("Test decision", "product", context, [], manyMessages);

    // Verify the assembler was called with only the last 12 messages
    const assemblerCalls = (assembleAnalysisPrompt as jest.Mock).mock.calls;
    const passedMessages = assemblerCalls[assemblerCalls.length - 1][2];
    expect(passedMessages).toHaveLength(12);
    expect(passedMessages[0].content).toBe("Message 9");
    expect(passedMessages[11].content).toBe("Message 20");
  });
});
