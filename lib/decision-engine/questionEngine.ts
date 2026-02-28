import { getAIClient, getModel, supportsJsonMode } from "../ai-client";

// Category-specific question frameworks - the raw thinking scaffolding for the AI
const QUESTION_FRAMEWORKS: Record<string, string> = {
  hiring: `You are evaluating a HIRING decision. Your questions must explore:
1. Runway impact — Does the founder have the runway to support this hire for 12+ months?
2. Urgency validity — Is this urgent because of real blockers or emotional FOMO?
3. Role clarity — Is the scope of this role defined, or are they hiring hope?
4. Failure cost — If this hire fails in 90 days, what damage occurs?
5. Build vs. contract — Could a contractor or tool solve this without full-time commitment?
DO NOT ask generic questions. Ask the uncomfortable ones.`,

  pricing: `You are evaluating a PRICING decision. Your questions must explore:
1. Price anchoring — What is the customer's reference point? What do they compare you to?
2. Willingness to pay — Has the founder tested real willingness to pay, or only asked?
3. Positioning signal — What does this price communicate about the product's position?
4. Revenue concentration — Does this pricing change help or hurt your most important customers?
5. Reversibility — How easy is it to reverse this pricing change for existing customers?`,

  fundraising: `You are evaluating a FUNDRAISING decision. Your questions must explore:
1. Leverage — What is the founder's negotiation position right now? Are they raising from weakness or strength?
2. Dilution math — At this valuation, what % are they giving up, and what does that mean at exit?
3. Alternatives — What happens if they don't raise? Is default alive realistic?
4. Investor quality — What does this investor bring beyond money? References?
5. Timing — Is this the right market timing, or is urgency driven by fear of running out?`,

  product: `You are evaluating a PRODUCT decision. Your questions must explore:
1. Problem validation — Is this solving a problem they've proven exists, or one they've assumed exists?
2. User vs. founder desire — Is this feature wanted by paying users or just by the founder?
3. Opportunity cost — What are they NOT building if they build this?
4. Complexity debt — What technical or operational surface area does this add?
5. Measurability — How will they know in 30 days if this was the right decision?`,

  growth: `You are evaluating a GROWTH decision. Your questions must explore:
1. Channel fit — Is there evidence this channel works for their specific ICP and price point?
2. Unit economics — At current conversion rates, what is the payback period for this channel?
3. Scalability — Does this channel scale, or does it require linear effort?
4. Dependency risk — What happens if this channel disappears or gets 3x more expensive?
5. Foundation — Is the product ready for growth, or will growth create churn they can't handle?`,

  operations: `You are evaluating an OPERATIONS decision. Your questions must explore:
1. Root cause — Is this solving a symptom or a root cause?
2. Leverage — Does solving this create compounding value, or is it a one-time fix?
3. Reversibility — Can this be undone if it creates new problems?
4. Tool vs. process — Is the problem tooling, process, or team behavior?
5. Opportunity cost — What else could the team be doing with this time?`,

  pivot: `You are evaluating a PIVOT decision. Your questions must explore:
1. Signal quality — Is the signal driving this pivot a data signal or an emotional signal?
2. What's being preserved — What validated learning from the current path transfers to the new one?
3. Team conviction — Does the team believe in the new direction, or is it founder-led alone?
4. Sunk cost trap — Would this pivot happen if they hadn't spent the last 6 months on version 1?
5. New risks — What new problems does the pivot create that didn't exist before?`,

  other: `You are evaluating a strategic decision. Your questions must explore:
1. Goal clarity — What does success look like in 90 days if this decision is correct?
2. Hidden constraints — What constraints exist that they haven't mentioned yet?
3. Assumptions at risk — What must be true for this decision to work out?
4. Worst case — What does failure look like, and how survivable is it?
5. Alternatives — What options are they NOT considering, and why not?`,
};

const BASE_QUESTION_SYSTEM = `You are CofounderAI — a strategic co-founder who asks uncomfortable, specific questions.

Your job is to generate THINKING questions, not information questions.

Rules:
- Questions must be SPECIFIC to the exact situation described, not generic startup advice
- Force the founder to confront things they may be avoiding
- Each question should be answerable in 2-3 sentences  
- Questions should be sequential: start with the most fundamental, end with the most tactical
- NO motivational language, NO "great question" - be direct

Return ONLY valid JSON:
{
  "opening": "One sentence acknowledging the decision and framing why these questions matter",
  "questions": ["question 1", "question 2", "question 3", "question 4"],
  "question_count": 4
}

Limit: 3-5 questions. Prefer 4 for complex decisions, 3 for simpler ones.`;

export interface QuestionOutput {
  opening: string;
  questions: string[];
  question_count: number;
}

export async function generateInitialQuestions(
  title: string,
  context: string | undefined | null,
  category: string
): Promise<QuestionOutput> {
  const framework = QUESTION_FRAMEWORKS[category] || QUESTION_FRAMEWORKS.other;
  const decisionInput = context
    ? `Decision: "${title}"\nContext provided: ${context}`
    : `Decision: "${title}"\nNo additional context provided.`;

  try {
    const openai = getAIClient();
    const response = await openai.chat.completions.create({
      model: getModel("reasoning"),
      messages: [
        {
          role: "system",
          content: `${BASE_QUESTION_SYSTEM}\n\n${framework}`,
        },
        { role: "user", content: decisionInput },
      ],
      temperature: 0.4,
      max_tokens: 600,
      ...(supportsJsonMode() ? { response_format: { type: "json_object" as const } } : {}),
    });

    const raw = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw) as QuestionOutput;
    return parsed;
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
