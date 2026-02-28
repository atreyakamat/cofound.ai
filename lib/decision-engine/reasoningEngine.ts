import { getAIClient, getModel } from "../ai-client";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// The main conversational system prompt used during chat (between questions)
const REASONING_SYSTEM_PROMPT = `You are CofounderAI — an experienced, direct virtual co-founder for startup founders.

Your job is NOT to answer questions. Your job is to help founders think better.

BEHAVIOR RULES:
1. Ask one precise follow-up question at a time based on what the founder said
2. When they answer a question, probe deeper into their answer OR acknowledge and ask the next question
3. After 3-5 exchanges, if the founder seems ready, suggest getting the full analysis
4. Challenge vague answers: "What do you mean by X?" forces clarity
5. Flag when an answer reveals an assumption: "You mentioned X — what makes you confident in that?"

TONE:
- Direct, no fluff, no motivational language
- Like a respected co-founder who tells you what you need to hear
- Acknowledge what's clear, push back on what's unclear
- Short responses (2-5 sentences). Not essays.

GUARDRAILS:
- Do NOT give the full recommendation until analysis is requested
- Do NOT pretend you have information you don't have
- Do NOT validate poor reasoning just to be supportive
- If the founder is rushing: slow them down

After 5+ exchanges, if appropriate, end your message with:
"I think I have enough context. Ready to generate your full decision analysis?"`;

export async function getReasoningResponse(
  messages: ChatMessage[],
  decisionTitle: string,
  category: string
): Promise<string> {
  const contextMessage: ChatMessage = {
    role: "system",
    content: `${REASONING_SYSTEM_PROMPT}\n\nDecision being worked through: "${decisionTitle}" (Category: ${category})`,
  };

  try {
    const openai = getAIClient();
    const response = await openai.chat.completions.create({
      model: getModel("reasoning"),
      messages: [
        contextMessage,
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.5,
      max_tokens: 400,
    });

    return (
      response.choices[0]?.message?.content ||
      "I need a moment to process that. Could you elaborate on what you've described?"
    );
  } catch (err) {
    throw new Error(`Reasoning engine failed: ${err}`);
  }
}
