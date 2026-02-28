import { getAIClient, getModel, supportsJsonMode } from "../ai-client";
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
  detected_biases: DetectedBias[];
}

const ANALYSIS_SYSTEM_PROMPT = `You are an experienced, candid startup co-founder helping analyze a strategic decision.

You reason in this order:
1. CLARIFY — Restate the real decision (not what was asked, but what needs deciding)
2. TRADEOFFS — What improves vs. worsens with each path?
3. RISKS — Short-term vs. long-term. Likelihood and mitigation.
4. SECOND ORDER — What happens AFTER the decision succeeds?
5. RECOMMENDATION — Directional guidance with explicit reasoning. Never pretend certainty.

GUARDRAILS:
- Never guarantee success
- Never ignore downside scenarios
- Always explain WHY not just WHAT
- Be specific to this context, not generic startup advice
- Confidence is "High" only when constraints are clear and alternatives are weak

Return ONLY valid JSON matching this exact schema:
{
  "summary": "2-3 sentence summary of the decision and its stakes",
  "decision_reframe": "Often the stated question is not the real question. Reframe what actually needs to be decided in one sentence.",
  "key_insights": ["3-5 insights that the founder may not have fully considered"],
  "tradeoffs": [
    {
      "doing_this": "What improves if they proceed",
      "not_doing_this": "What they give up or risk if they don't proceed"
    }
  ],
  "risks": [
    {
      "risk": "Specific risk",
      "likelihood": "Low | Medium | High",
      "mitigation": "Specific mitigation action"
    }
  ],
  "second_order_effects": ["What happens AFTER this decision succeeds? List 2-3 second-order consequences."],
  "recommendation": "Clear directional recommendation in 1-2 sentences",
  "recommendation_reasoning": "The explicit reasoning chain behind the recommendation",
  "confidence": "Low | Medium | High",
  "confidence_reasoning": "Why this confidence level, what information is missing",
  "next_steps": ["3-5 concrete, specific next actions"],
  "detected_biases": []
}`;

export async function generateStructuredAnalysis(
  title: string,
  category: string,
  context: ReasoningContext,
  detectedBiases: DetectedBias[],
  messages: Array<{ role: string; content: string }>
): Promise<StructuredAnalysis> {
  const contextSummary = JSON.stringify(context, null, 2);
  const conversationSummary = messages
    .filter((m) => m.role !== "system")
    .slice(-12) // Last 12 messages to stay within context
    .map((m) => `${m.role === "user" ? "Founder" : "AI"}: ${m.content}`)
    .join("\n\n");

  const userPrompt = `Decision: "${title}" (Category: ${category})

Extracted Context:
${contextSummary}

Conversation:
${conversationSummary}

Detected biases from founder's reasoning: ${detectedBiases.length > 0 ? JSON.stringify(detectedBiases) : "None detected"}

Generate the full structured analysis.`;

  try {
    const openai = getAIClient();
    const response = await openai.chat.completions.create({
      model: getModel("reasoning"),
      messages: [
        { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      ...(supportsJsonMode() ? { response_format: { type: "json_object" as const } } : {}),
    });

    const raw = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw) as StructuredAnalysis;
    // Merge biases into analysis
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
