import { openai } from "./client";
import { SYSTEM_PROMPT } from "./constants";
import type { ChatMessage } from "./types";

export async function getAIResponse(messages: ChatMessage[]): Promise<string> {
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || "";
}