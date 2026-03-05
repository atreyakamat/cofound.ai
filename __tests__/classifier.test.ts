/**
 * Tests for lib/decision-engine/classifier.ts
 * Mocks the AI client so no real API calls are made.
 */

// Mock the entire ai-client module before importing classifier
jest.mock("@/lib/ai-client", () => ({
  chatCompletion: jest.fn(),
}));

import { classifyDecision } from "@/lib/decision-engine/classifier";
import { chatCompletion } from "@/lib/ai-client";

const mockChatCompletion = chatCompletion as jest.MockedFunction<typeof chatCompletion>;

beforeEach(() => {
  mockChatCompletion.mockReset();
});

describe("classifyDecision", () => {
  it("parses a valid classification response", async () => {
    mockChatCompletion.mockResolvedValueOnce(JSON.stringify({
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
    mockChatCompletion.mockResolvedValueOnce(JSON.stringify({
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
    mockChatCompletion.mockRejectedValueOnce(new Error("API error"));

    const result = await classifyDecision("Some obscure decision");
    // Should return fallback (not throw)
    expect(result).toBeDefined();
    expect(result.complexity).toBe("Medium"); // fallback default
  });

  it("handles malformed JSON response gracefully", async () => {
    mockChatCompletion.mockResolvedValueOnce("not json at all {{{}}}");
    const result = await classifyDecision("What to do about our pricing?");
    // Should fall back to keyword-based classification
    expect(result).toBeDefined();
  });

  it("passes context to the AI when provided", async () => {
    mockChatCompletion.mockResolvedValueOnce(JSON.stringify({
      decision_type: "Fundraising",
      complexity: "High",
      time_horizon: "3-6 months",
      risk_level: "High",
      category: "fundraising",
    }));

    await classifyDecision("Series A timing", "We have 8 months runway");
    const callArgs = mockChatCompletion.mock.calls[0][0];
    const userMsg = callArgs.messages.find((m: { role: string }) => m.role === "user");
    expect(userMsg?.content).toContain("Series A timing");
    expect(userMsg?.content).toContain("8 months runway");
  });

  it("uses fast task tier for classification", async () => {
    mockChatCompletion.mockResolvedValueOnce(JSON.stringify({
      decision_type: "Product",
      complexity: "Low",
      time_horizon: "Immediate",
      risk_level: "Low",
      category: "product",
    }));

    await classifyDecision("Ship the new dashboard?");
    const callArgs = mockChatCompletion.mock.calls[0][0];
    expect(callArgs.task).toBe("fast");
  });
});
