/**
 * Tests for lib/decision-engine/classifier.ts
 * Mocks the AI client so no real API calls are made.
 */

// Mock the entire ai-client module before importing classifier
jest.mock("@/lib/ai-client", () => ({
  getAIClient: jest.fn(),
  getModel: jest.fn(() => "gpt-4o-mini"),
  supportsJsonMode: jest.fn(() => true),
}));

import { classifyDecision } from "@/lib/decision-engine/classifier";
import { getAIClient } from "@/lib/ai-client";

const mockCreate = jest.fn();
(getAIClient as jest.Mock).mockReturnValue({
  chat: { completions: { create: mockCreate } },
});

function mockAIResponse(content: string) {
  mockCreate.mockResolvedValueOnce({
    choices: [{ message: { content } }],
  });
}

beforeEach(() => {
  mockCreate.mockReset();
  (getAIClient as jest.Mock).mockReturnValue({
    chat: { completions: { create: mockCreate } },
  });
});

describe("classifyDecision", () => {
  it("parses a valid classification response", async () => {
    mockAIResponse(JSON.stringify({
      decision_type: "Hiring",
      complexity: "High",
      time_horizon: "1-3 months",
      risk_level: "Medium",
      category: "hiring",
    }));

    const result = await classifyDecision("Should I hire a CTO?");
    expect(result.decision_type).toBe("Hiring");
    expect(result.complexity).toBe("High");
    expect(result.category).toBe("hiring");
  });

  it("parses a pricing decision correctly", async () => {
    mockAIResponse(JSON.stringify({
      decision_type: "Pricing",
      complexity: "Medium",
      time_horizon: "Immediate",
      risk_level: "Medium",
      category: "pricing",
    }));

    const result = await classifyDecision("Should we move from freemium to paid?");
    expect(result.decision_type).toBe("Pricing");
    expect(result.category).toBe("pricing");
  });

  it("returns a fallback classification when AI fails", async () => {
    mockCreate.mockRejectedValueOnce(new Error("API error"));

    const result = await classifyDecision("Some obscure decision");
    // Should return fallback (not throw)
    expect(result).toBeDefined();
    expect(result.complexity).toBe("Medium"); // fallback default
  });

  it("handles malformed JSON response gracefully", async () => {
    mockAIResponse("not json at all {{{}}}");
    const result = await classifyDecision("What to do about our pricing?");
    // Should fall back to keyword-based classification
    expect(result).toBeDefined();
  });

  it("passes context to the AI when provided", async () => {
    mockAIResponse(JSON.stringify({
      decision_type: "Fundraising",
      complexity: "High",
      time_horizon: "3-6 months",
      risk_level: "High",
      category: "fundraising",
    }));

    await classifyDecision("Series A timing", "We have 8 months runway");
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.messages[1].content).toContain("Series A timing");
    expect(callArgs.messages[1].content).toContain("8 months runway");
  });

  it("uses the model returned by getModel", async () => {
    mockAIResponse(JSON.stringify({
      decision_type: "Product",
      complexity: "Low",
      time_horizon: "Immediate",
      risk_level: "Low",
      category: "product",
    }));

    await classifyDecision("Ship the new dashboard?");
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.model).toBe("gpt-4o-mini"); // from our mock
  });
});
