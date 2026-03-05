import { chatCompletion } from "../ai-client";
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
    const raw = await chatCompletion({
      task: "fast",
      messages: assembledMessages,
      temperature: 0,
      maxTokens: 900,
      json: true,
    });

    const parsed = JSON.parse(raw || "{}");
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
