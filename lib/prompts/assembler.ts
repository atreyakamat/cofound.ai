/**
 * PROMPT ASSEMBLER
 *
 * Composes all prompt layers into a final messages array
 * ready to send to any OpenAI-compatible API.
 *
 * Architecture:
 *   MASTER_SYSTEM_PROMPT
 *   + DECISION_FRAMEWORK_PROMPT  (analysis only)
 *   + PERSONALITY_PROMPT         (if profile available)
 *   + TASK_PROMPT                (per-operation template)
 *   + TONE_GUARDRAILS
 *   + BIAS_DETECTION_PROMPT      (analysis only)
 *   → { role: "system", content: "..." }
 */

import {
  MASTER_SYSTEM_PROMPT,
  DECISION_FRAMEWORK_PROMPT,
  TONE_GUARDRAILS,
  BIAS_DETECTION_PROMPT,
} from "./identity";
import { PERSONALITY_PROMPTS, type FounderPersonality } from "./personality";
import {
  buildQuestionPrompt,
  buildContextPrompt,
  buildAnalysisPrompt,
  buildChatSystemPrompt,
} from "./templates";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export interface FounderContext {
  name?: string;
  personality?: FounderPersonality;
  companyName?: string;
  stage?: string;
  industry?: string;
}

// ─── QUESTION GENERATION ───────────────────────────────────────────────────

export function assembleQuestionPrompt(
  decisionTitle: string,
  decisionCategory: string,
  founderCtx: FounderContext = {}
): ChatMessage[] {
  const systemParts = [
    MASTER_SYSTEM_PROMPT,
    founderCtx.personality ? PERSONALITY_PROMPTS[founderCtx.personality] : "",
    founderCtx.companyName
      ? `Founder context: ${founderCtx.name ?? "Founder"} is building ${founderCtx.companyName} (${founderCtx.stage ?? "early stage"}, ${founderCtx.industry ?? "tech"}).`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");

  return [
    { role: "system", content: systemParts },
    {
      role: "user",
      content: buildQuestionPrompt(decisionTitle, decisionCategory, founderCtx.name),
    },
  ];
}

// ─── CONTEXT BUILDING ──────────────────────────────────────────────────────

export function assembleContextPrompt(
  decisionTitle: string,
  conversationHistory: Array<{ role: string; content: string }>
): ChatMessage[] {
  return [
    { role: "system", content: MASTER_SYSTEM_PROMPT },
    {
      role: "user",
      content: buildContextPrompt(decisionTitle, conversationHistory),
    },
  ];
}

// ─── FULL ANALYSIS ─────────────────────────────────────────────────────────

export function assembleAnalysisPrompt(
  decisionTitle: string,
  structuredContext: {
    primary_goal: string;
    constraints: string[];
    assumptions: string[];
    risks: string[];
    unknowns: string[];
  },
  conversationHistory: Array<{ role: string; content: string }>,
  founderCtx: FounderContext = {}
): ChatMessage[] {
  const systemParts = [
    MASTER_SYSTEM_PROMPT,
    DECISION_FRAMEWORK_PROMPT,
    founderCtx.personality ? PERSONALITY_PROMPTS[founderCtx.personality] : "",
    TONE_GUARDRAILS,
    BIAS_DETECTION_PROMPT,
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");

  return [
    { role: "system", content: systemParts },
    {
      role: "user",
      content: buildAnalysisPrompt(decisionTitle, structuredContext, conversationHistory),
    },
  ];
}

// ─── CHAT (CONVERSATIONAL FOLLOW-UP) ──────────────────────────────────────

export function assembleChatMessages(
  decisionTitle: string,
  decisionCategory: string,
  conversationHistory: Array<{ role: string; content: string }>,
  newUserMessage: string,
  founderCtx: FounderContext = {}
): ChatMessage[] {
  const systemParts = [
    buildChatSystemPrompt(decisionTitle, decisionCategory),
    founderCtx.personality ? PERSONALITY_PROMPTS[founderCtx.personality] : "",
    founderCtx.companyName
      ? `Founder: ${founderCtx.name ?? "Founder"} · ${founderCtx.companyName} · ${founderCtx.stage ?? "early stage"}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");

  const history: ChatMessage[] = conversationHistory
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  return [
    { role: "system", content: systemParts },
    ...history,
    { role: "user", content: newUserMessage },
  ];
}
