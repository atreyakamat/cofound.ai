import { getAIClient, getModel, supportsJsonMode } from "../ai-client";
import { assembleContextPrompt } from "../prompts";

export interface ReasoningContext {
  primary_goal: string;
  goal: string;          // alias — keeping backward compat
  constraints: string[];
  assumptions: string[];
  risks: string[];
  unknowns: string[];
  alternatives: string[];
  key_facts: string[];
}

export async function buildReasoningContext(
  title: string,
  category: string,
  messages: Array<{ role: string; content: string }>
): Promise<ReasoningContext> {
  const assembledMessages = assembleContextPrompt(title, messages);
  // Add category hint to user message
  assembledMessages[assembledMessages.length - 1].content += `\n\nCategory: ${category}`;

  try {
    const openai = getAIClient();
    const response = await openai.chat.completions.create({
      model: getModel("fast"),
      messages: assembledMessages as Parameters<typeof openai.chat.completions.create>[0]["messages"],
      temperature: 0,
      max_tokens: 900,
      ...(supportsJsonMode() ? { response_format: { type: "json_object" as const } } : {}),
    });

    const raw = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    return {
      primary_goal: parsed.primary_goal || parsed.goal || title,
      goal: parsed.primary_goal || parsed.goal || title,
      constraints: parsed.constraints || [],
      assumptions: parsed.assumptions || [],
      risks: parsed.risks || [],
      unknowns: parsed.unknowns || [],
      alternatives: parsed.alternatives || [],
      key_facts: parsed.key_facts || [],
    };
  } catch {
    return {
      primary_goal: title,
      goal: title,
      constraints: [],
      assumptions: [],
      risks: [],
      unknowns: [],
      alternatives: [],
      key_facts: [],
    };
  }
}
