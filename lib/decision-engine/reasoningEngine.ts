import { chatCompletion } from "../ai-client";
import { assembleChatMessages, type FounderContext } from "../prompts";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function getReasoningResponse(
  messages: ChatMessage[],
  decisionTitle: string,
  category: string,
  founderCtx: FounderContext = {}
): Promise<string> {
  // Get the latest user message
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMsg) return "I need a moment to process that. Could you elaborate?";

  // All prior messages (excluding the latest user msg)
  const history = messages.slice(0, -1).filter((m) => m.role === "user" || m.role === "assistant");

  const assembled = assembleChatMessages(
    decisionTitle,
    category,
    history,
    lastUserMsg.content,
    founderCtx
  );

  try {
    const raw = await chatCompletion({
      task: "reasoning",
      messages: assembled,
      temperature: 0.5,
      maxTokens: 500,
    });

    return raw || "I need a moment to process that. Could you elaborate on what you've described?";
  } catch (err) {
    throw new Error(`Reasoning engine failed: ${err}`);
  }
}
