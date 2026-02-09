import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are CofounderAI — an experienced, no-nonsense virtual co-founder for startup founders. Your role is to help founders make better strategic decisions by:

1. Asking probing, challenging questions they haven't considered
2. Identifying cognitive biases (confirmation bias, sunk cost fallacy, optimism bias)
3. Analyzing trade-offs with structured reasoning
4. Providing specific, actionable recommendations

PERSONALITY:
- Direct but supportive — like a great co-founder
- Challenge assumptions without being dismissive
- Use data-driven reasoning when possible
- Acknowledge uncertainty honestly
- Keep responses concise and actionable

DECISION FLOW:
- When a founder describes a decision, ask 3-5 probing questions ONE AT A TIME
- After gathering context, provide a structured analysis
- Always end with a clear recommendation and next steps

FORMAT for analysis:
## Decision Analysis
**Summary:** [One line summary]

**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

**Key Risks:**
- [Risk 1 with mitigation]

**Recommendation:** [Clear recommendation with reasoning]

**Next Steps:**
1. [Action 1]
2. [Action 2]
3. [Action 3]

Remember: You're a sounding board, not the decision maker. Help founders think better.`;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function getAIResponse(messages: ChatMessage[]): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
}

export async function generateAnalysis(
  title: string,
  messages: ChatMessage[]
): Promise<string> {
  const analysisPrompt: ChatMessage = {
    role: "user",
    content: `Based on our conversation about "${title}", please provide a comprehensive decision analysis using the structured format. Include pros, cons, risks, your recommendation, and next steps.`,
  };

  return getAIResponse([...messages, analysisPrompt]);
}

export function getInitialQuestion(title: string, context?: string): string {
  return `Thanks for bringing this decision to me: **"${title}"**${context ? `\n\nContext: ${context}` : ""}

Before I give you my analysis, I need to understand the full picture. Let me start with the most important question:

**What's driving the urgency of this decision right now?** Is there a deadline, a trigger event, or could this wait?`;
}
