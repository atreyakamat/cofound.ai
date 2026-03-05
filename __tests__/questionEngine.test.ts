/**
 * Tests for lib/decision-engine/questionEngine.ts
 * Tests both the AI-dependent generateInitialQuestions and the pure formatQuestionsAsMessage.
 */

jest.mock("@/lib/ai-client", () => ({
  chatCompletion: jest.fn(),
}));

import {
  generateInitialQuestions,
  formatQuestionsAsMessage,
} from "@/lib/decision-engine/questionEngine";
import type { QuestionOutput } from "@/lib/decision-engine/questionEngine";
import { chatCompletion } from "@/lib/ai-client";

const mockChatCompletion = chatCompletion as jest.MockedFunction<typeof chatCompletion>;

beforeEach(() => {
  mockChatCompletion.mockReset();
});

const SAMPLE_QUESTIONS: QuestionOutput = {
  opening: "Before I give you my view on this hiring decision, I need to understand a few things.",
  questions: [
    "If this hire doesn't work out in 90 days, what's the runway damage?",
    "What specific blocker makes this hire urgent today vs. in 3 months?",
    "Have you written down a 30/60/90 day outcome for this role?",
  ],
  question_count: 3,
};

// ─── generateInitialQuestions ─────────────────────────────────────────────────

describe("generateInitialQuestions", () => {
  it("returns parsed questions from AI response", async () => {
    mockChatCompletion.mockResolvedValueOnce(JSON.stringify(SAMPLE_QUESTIONS));
    const result = await generateInitialQuestions("Hire a VP Engineering", undefined, "hiring");
    expect(result.questions).toHaveLength(3);
    expect(result.opening).toContain("hiring decision");
  });

  it("falls back to hardcoded questions when AI fails", async () => {
    mockChatCompletion.mockRejectedValueOnce(new Error("Timeout"));
    const result = await generateInitialQuestions("Some hiring decision", undefined, "hiring");
    expect(result.questions.length).toBeGreaterThan(0);
    expect(result.opening).toBeDefined();
  });

  it("falls back to 'other' category questions for unknown category", async () => {
    mockChatCompletion.mockRejectedValueOnce(new Error("Timeout"));
    const result = await generateInitialQuestions("Weird decision", undefined, "something_unknown");
    expect(result.questions.length).toBeGreaterThan(0);
  });

  it("includes context in the user message when provided", async () => {
    mockChatCompletion.mockResolvedValueOnce(JSON.stringify(SAMPLE_QUESTIONS));
    await generateInitialQuestions("Hire a CTO", "We're pre-seed, 12 months runway", "hiring");

    const callArgs = mockChatCompletion.mock.calls[0][0];
    const userMsg = callArgs.messages[callArgs.messages.length - 1];
    expect(userMsg.content).toContain("pre-seed");
    expect(userMsg.content).toContain("12 months runway");
  });

  it("uses the 'hiring' framework when category is hiring", async () => {
    mockChatCompletion.mockResolvedValueOnce(JSON.stringify(SAMPLE_QUESTIONS));
    await generateInitialQuestions("Hire a designer", null, "hiring");

    const callArgs = mockChatCompletion.mock.calls[0][0];
    const systemMsg = callArgs.messages[0];
    expect(systemMsg.content).toContain("HIRING");
    expect(systemMsg.content).toContain("runway");
  });

  it("uses the 'pricing' framework when category is pricing", async () => {
    mockChatCompletion.mockResolvedValueOnce(JSON.stringify(SAMPLE_QUESTIONS));
    await generateInitialQuestions("Change pricing model", null, "pricing");

    const callArgs = mockChatCompletion.mock.calls[0][0];
    const systemMsg = callArgs.messages[0];
    expect(systemMsg.content).toContain("PRICING");
  });

  it("returns 3-5 questions only", async () => {
    // AI returns 4 questions
    mockChatCompletion.mockResolvedValueOnce(JSON.stringify({
      ...SAMPLE_QUESTIONS,
      questions: ["Q1", "Q2", "Q3", "Q4"],
      question_count: 4,
    }));
    const result = await generateInitialQuestions("Anything", null, "product");
    expect(result.questions.length).toBeGreaterThanOrEqual(3);
    expect(result.questions.length).toBeLessThanOrEqual(5);
  });
});

// ─── formatQuestionsAsMessage (pure function — no mock needed) ────────────────

describe("formatQuestionsAsMessage", () => {
  it("formats questions into a readable message string", () => {
    const msg = formatQuestionsAsMessage(SAMPLE_QUESTIONS);
    expect(msg).toContain(SAMPLE_QUESTIONS.opening);
    expect(msg).toContain("**1.");
    expect(msg).toContain("**2.");
    expect(msg).toContain("**3.");
  });

  it("includes the footer prompt to answer and request analysis", () => {
    const msg = formatQuestionsAsMessage(SAMPLE_QUESTIONS);
    expect(msg).toContain("Answer whichever feels most relevant");
  });

  it("numbers questions correctly", () => {
    const output: QuestionOutput = {
      opening: "Opening.",
      questions: ["First?", "Second?", "Third?", "Fourth?"],
      question_count: 4,
    };
    const msg = formatQuestionsAsMessage(output);
    expect(msg).toContain("**4.");
    expect(msg).not.toContain("**5."); // Only 4 questions
  });
});
