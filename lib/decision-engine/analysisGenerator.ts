import { getAIClient, getModel, supportsJsonMode } from "../ai-client";
import { assembleAnalysisPrompt, type FounderContext } from "../prompts";
import type { ReasoningContext } from "./contextBuilder";
import type { DetectedBias } from "./biasDetector";

export interface StructuredAnalysis {
  summary: string;
  decision_reframe: string;
  key_insights: string[];
  tradeoffs: Array<{ doing_this: string; not_doing_this: string }>;
  risks: Array<{ risk: string; likelihood: "Low" | "Medium" | "High"; mitigation: string }>;
  second_order_effects: string[];
  recommendation: string;
  recommendation_reasoning: string;
  confidence: "Low" | "Medium" | "High";
  confidence_reasoning: string;
  next_steps: string[];
  reflection_question: string;
  detected_biases: DetectedBias[];
}

export async function generateStructuredAnalysis(
  title: string,
  category: string,
  context: ReasoningContext,
  detectedBiases: DetectedBias[],
  messages: Array<{ role: string; content: string }>,
  founderCtx: FounderContext = {}
): Promise<StructuredAnalysis> {
  // Build the structured context for the assembler
  const structuredContext = {
    primary_goal: context.primary_goal || context.goal,
    constraints: context.constraints,
    assumptions: context.assumptions,
    risks: context.risks,
    unknowns: context.unknowns || [],
  };

  // Limit to last 12 messages for context window efficiency
  const recentMessages = messages.slice(-12);

  const assembled = assembleAnalysisPrompt(
    title,
    structuredContext,
    recentMessages,
    founderCtx
  );

  // Append detected biases info to user message
  if (detectedBiases.length > 0) {
    assembled[assembled.length - 1].content += `\n\nPre-detected cognitive biases:\n${JSON.stringify(detectedBiases, null, 2)}`;
  }

  // Override JSON schema to match our StructuredAnalysis interface exactly
  assembled[assembled.length - 1].content += `\n\nReturn ONLY valid JSON with this EXACT schema:
{
  "summary": "2-3 sentence summary",
  "decision_reframe": "What actually needs deciding (often different from what was asked)",
  "key_insights": ["3-5 insights the founder may have missed"],
  "tradeoffs": [{"doing_this": "...", "not_doing_this": "..."}],
  "risks": [{"risk": "...", "likelihood": "Low|Medium|High", "mitigation": "..."}],
  "second_order_effects": ["2-3 downstream consequences"],
  "recommendation": "Clear directional recommendation",
  "recommendation_reasoning": "Reasoning chain behind the recommendation",
  "confidence": "Low|Medium|High",
  "confidence_reasoning": "Why this confidence level",
  "next_steps": ["3-5 concrete actions"],
  "reflection_question": "One question for the founder to sit with"
}`;

  try {
    const openai = getAIClient();
    const response = await openai.chat.completions.create({
      model: getModel("reasoning"),
      messages: assembled as Parameters<typeof openai.chat.completions.create>[0]["messages"],
      temperature: 0.3,
      max_tokens: 2500,
      ...(supportsJsonMode() ? { response_format: { type: "json_object" as const } } : {}),
    });

    const raw = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw) as StructuredAnalysis;
    parsed.detected_biases = detectedBiases;
    return parsed;
  } catch (err) {
    throw new Error(`Analysis generation failed: ${err}`);
  }
}

export function serializeAnalysis(analysis: StructuredAnalysis): string {
  return JSON.stringify(analysis);
}

export function deserializeAnalysis(raw: string): StructuredAnalysis | null {
  try {
    const parsed = JSON.parse(raw);
    // Validate it's actually a structured analysis
    if (parsed.recommendation && parsed.risks) return parsed as StructuredAnalysis;
    return null;
  } catch {
    return null;
  }
}
