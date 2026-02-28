import { getAIClient, getModel, supportsJsonMode } from "../ai-client";
import { assembleQuestionPrompt, type FounderContext } from "../prompts";

// Category-specific question lenses injected alongside the master system prompt
const QUESTION_LENSES: Record<string, string> = {
  hiring: `Category lens — HIRING:
- Runway: 12+ months runway to support this hire?
- Urgency validity: real blocker vs FOMO?
- Role clarity: scope defined or hiring hope?
- Failure cost: blast radius if hire fails in 90 days?
- Build vs contract: could a contractor solve this cheaper?`,

  pricing: `Category lens — PRICING:
- Real vs theoretical willingness to pay
- Customer price reference point
- Positioning signal the price sends
- Revenue concentration impact
- Reversibility for existing customers`,

  fundraising: `Category lens — FUNDRAISING:
- Leverage: raising from strength or desperation?
- Dilution math at this valuation
- Default alive: what happens without the raise?
- Investor quality beyond capital
- Market timing vs fear-driven urgency`,

  product: `Category lens — PRODUCT:
- Problem validated with paying users or assumed?
- User desire vs founder desire
- Opportunity cost of building this
- Technical/operational surface area added
- Measurability: how will they know in 30 days?`,

  growth: `Category lens — GROWTH:
- Channel fit evidence for this specific ICP
- Unit economics payback period
- Scalability: linear effort or compound?
- Dependency risk if channel disappears
- Is the product ready for growth (churn risk)?`,

  operations: `Category lens — OPERATIONS:
- Root cause vs symptom
- Does fixing this compound or is it one-time?
- Reversibility
- Tool vs process vs team behavior
- Opportunity cost of the time spent`,

  pivot: `Category lens — PIVOT:
- Signal quality: data-driven signal or emotional signal?
- What validated learning carries over?
- Team conviction vs founder-only belief
- Sunk cost check: would this pivot happen without prior investment?
- New risks the pivot creates`,

  other: `Category lens — STRATEGIC:
- Success criteria in 90 days
- Hidden constraints not yet mentioned
- Assumptions that must hold for success
- Worst case survivability
- Options not being considered and why`,
};

export interface QuestionOutput {
  opening: string;
  questions: string[];
  question_count: number;
}

export async function generateInitialQuestions(
  title: string,
  context: string | undefined | null,
  category: string,
  founderCtx: FounderContext = {}
): Promise<QuestionOutput> {
  const decisionDescription = context
    ? `"${title}"\n\nAdditional context: ${context}`
    : `"${title}"`;

  const lens = QUESTION_LENSES[category] ?? QUESTION_LENSES.other;

  const messages = assembleQuestionPrompt(decisionDescription, category, founderCtx);
  // Inject category lens into system message
  messages[0].content += `\n\n---\n\n${lens}`;
  // Override user message with explicit JSON format instruction
  messages[messages.length - 1].content = `${decisionDescription}

Generate 3–5 probing questions. Return ONLY valid JSON:
{
  "opening": "One sentence acknowledging the decision and framing why these questions matter",
  "questions": ["question 1", "question 2", "question 3"],
  "question_count": 3
}`;

  try {
    const openai = getAIClient();
    const response = await openai.chat.completions.create({
      model: getModel("reasoning"),
      messages: messages as Parameters<typeof openai.chat.completions.create>[0]["messages"],
      temperature: 0.4,
      max_tokens: 700,
      ...(supportsJsonMode() ? { response_format: { type: "json_object" as const } } : {}),
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    return JSON.parse(raw) as QuestionOutput;
  } catch {
    return getFallbackQuestions(category, title);
  }
}

function getFallbackQuestions(category: string, title: string): QuestionOutput {
  const fallbacks: Record<string, string[]> = {
    hiring: [
      "If this hire doesn't work out in 90 days, what's the blast radius on your runway and team morale?",
      "What is the actual blocker right now that makes this hire urgent today vs. in 3 months?",
      "What have you tried as an alternative — tools, contractors, or restructuring existing responsibilities?",
      "Do you have a defined outcome for this role in the first 30/60/90 days written down?",
    ],
    pricing: [
      "Have you tested willingness to pay by actually asking customers to pay, or only by asking theoretically?",
      "What does your current pricing signal about who your product is for?",
      "If you raise prices and lose 20% of users, are you better or worse off financially?",
    ],
    other: [
      "What does success look like in 90 days if this decision turns out to be correct?",
      "What are you assuming must be true for this to work out?",
      "What's the worst realistic outcome, and how survivable is it?",
      "What option are you NOT considering, and why not?",
    ],
  };

  const questions = fallbacks[category] || fallbacks.other;
  return {
    opening: `Let me work through "${title}" with you. Before giving you my view, I need to understand the full picture.`,
    questions,
    question_count: questions.length,
  };
}

export function formatQuestionsAsMessage(output: QuestionOutput): string {
  const numbered = output.questions
    .map((q, i) => `**${i + 1}. ${q}**`)
    .join("\n\n");
  return `${output.opening}\n\n${numbered}\n\n*Answer whichever feels most relevant — then request full analysis when ready.*`;
}
