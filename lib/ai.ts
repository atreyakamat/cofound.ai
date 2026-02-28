// lib/ai.ts — compatibility shim
// The actual AI logic now lives in lib/decision-engine/
// This file provides backward-compatible exports.

export { getReasoningResponse as getAIResponse } from "./decision-engine/reasoningEngine";
export type { ChatMessage } from "./decision-engine/reasoningEngine";

