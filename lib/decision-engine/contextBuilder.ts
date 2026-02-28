import { getAIClient, getModel, supportsJsonMode } from "../ai-client";

export interface ReasoningContext {
  goal: string;
  constraints: string[];
  assumptions: string[];
  risks: string[];
  alternatives: string[];
  key_facts: string[];
}

const CONTEXT_BUILDER_PROMPT = `You extract structured reasoning context from a startup founder's decision conversation.

Read the conversation and extract the following into ONLY valid JSON. Do not invent facts — only extract what is stated or strongly implied.

{
  "goal": "What outcome the founder is optimizing for",
  "constraints": ["list of real constraints mentioned: time, money, team, runway, etc."],
  "assumptions": ["things that must be true for success that haven't been verified"],
  "risks": ["specific risks mentioned or implied"],
  "alternatives": ["other options mentioned or implied that weren't chosen"],
  "key_facts": ["concrete numbers, deadlines, or facts mentioned"]
}

If a field has no data, return an empty array or empty string. Never fabricate.`;

export async function buildReasoningContext(
  title: string,
  category: string,
  messages: Array<{ role: string; content: string }>
): Promise<ReasoningContext> {
  const conversationText = messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? "Founder" : "AI"}: ${m.content}`)
    .join("\n\n");

  try {
    const openai = getAIClient();
    const response = await openai.chat.completions.create({
      model: getModel("fast"),
      messages: [
        { role: "system", content: CONTEXT_BUILDER_PROMPT },
        {
          role: "user",
          content: `Decision: "${title}" (Category: ${category})\n\nConversation:\n${conversationText}`,
        },
      ],
      temperature: 0,
      max_tokens: 800,
      ...(supportsJsonMode() ? { response_format: { type: "json_object" as const } } : {}),
    });

    const raw = response.choices[0]?.message?.content || "{}";
    return JSON.parse(raw) as ReasoningContext;
  } catch {
    return {
      goal: title,
      constraints: [],
      assumptions: [],
      risks: [],
      alternatives: [],
      key_facts: [],
    };
  }
}
