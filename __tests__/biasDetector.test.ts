/**
 * Tests for lib/decision-engine/biasDetector.ts
 */

jest.mock("@/lib/ai-client", () => ({
  getAIClient: jest.fn(),
  getModel: jest.fn(() => "gpt-4o-mini"),
  supportsJsonMode: jest.fn(() => true),
}));

import { detectBiases } from "@/lib/decision-engine/biasDetector";
import { getAIClient } from "@/lib/ai-client";

const mockCreate = jest.fn();
beforeEach(() => {
  mockCreate.mockReset();
  (getAIClient as jest.Mock).mockReturnValue({
    chat: { completions: { create: mockCreate } },
  });
});

function mockAIResponse(content: string) {
  mockCreate.mockResolvedValueOnce({
    choices: [{ message: { content } }],
  });
}

const SHORT_MESSAGES = [
  { role: "user", content: "Short message." },
];

const LONG_MESSAGES = [
  { role: "user", content: "We've already invested $200k in building this feature and all my advisors and investors say we should continue. I've read three articles about how this is the right approach. The data also supports what I already thought. Honestly every competitor is doing this." },
  { role: "assistant", content: "Interesting — what specific data are you looking at?" },
  { role: "user", content: "Revenue is flat but that's just because we haven't marketed it yet. We just need to keep pushing. We've spent too much to stop now." },
];

describe("detectBiases", () => {
  it("returns empty array for messages under 100 chars (not enough signal)", async () => {
    const result = await detectBiases(SHORT_MESSAGES);
    expect(result).toEqual([]);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("detects sunk cost and confirmation biases in long conversation", async () => {
    mockAIResponse(JSON.stringify({
      detected_biases: [
        {
          bias: "Sunk cost fallacy",
          signal: "We've spent too much to stop now",
          reframe: "What decision would you make if you were starting fresh today with no prior investment?",
        },
        {
          bias: "Confirmation bias",
          signal: "I've read three articles about how this is the right approach",
          reframe: "What evidence would change your mind?",
        },
      ],
    }));

    const result = await detectBiases(LONG_MESSAGES);
    expect(result).toHaveLength(2);
    expect(result[0].bias).toBe("Sunk cost fallacy");
    expect(result[1].bias).toBe("Confirmation bias");
  });

  it("returns empty array when no biases detected", async () => {
    mockAIResponse(JSON.stringify({ detected_biases: [] }));
    const result = await detectBiases(LONG_MESSAGES);
    expect(result).toEqual([]);
  });

  it("returns empty array when AI call fails", async () => {
    mockCreate.mockRejectedValueOnce(new Error("Network error"));
    const result = await detectBiases(LONG_MESSAGES);
    expect(result).toEqual([]);
  });

  it("only analyzes user (founder) messages, not assistant messages", async () => {
    mockAIResponse(JSON.stringify({ detected_biases: [] }));
    await detectBiases(LONG_MESSAGES);

    const callArgs = mockCreate.mock.calls[0][0];
    const userContent = callArgs.messages[1].content;
    expect(userContent).toContain("We've already invested $200k");
    // Should NOT include assistant message content
    expect(userContent).not.toContain("Interesting — what specific data");
  });

  it("each returned bias has bias, signal, and reframe fields", async () => {
    mockAIResponse(JSON.stringify({
      detected_biases: [
        {
          bias: "Urgency bias",
          signal: "We need to decide this week",
          reframe: "What's the real cost of deciding in 2 weeks instead?",
        },
      ],
    }));

    const result = await detectBiases(LONG_MESSAGES);
    expect(result[0]).toHaveProperty("bias");
    expect(result[0]).toHaveProperty("signal");
    expect(result[0]).toHaveProperty("reframe");
  });
});
