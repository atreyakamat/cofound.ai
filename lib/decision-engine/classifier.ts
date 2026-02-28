import { getAIClient, getModel, supportsJsonMode } from "../ai-client";

export interface DecisionClassification {
  decision_type: string;
  complexity: "Low" | "Medium" | "High";
  time_horizon: string;
  risk_level: "Low" | "Medium" | "High";
  category: string;
}

const CLASSIFIER_PROMPT = `You are a startup decision classification system. Analyze the decision and return ONLY valid JSON with no markdown, no explanation.

Return exactly:
{
  "decision_type": "one of: Hiring | Product | Pricing | Growth | Fundraising | Operations | Pivot | Unknown",
  "complexity": "one of: Low | Medium | High",
  "time_horizon": "one of: Immediate | 1-3 months | 3-6 months | 6-12 months | 1+ years",
  "risk_level": "one of: Low | Medium | High",
  "category": "one of: hiring | product | pricing | growth | fundraising | operations | pivot | other"
}

Classification rules:
- Hiring: team decisions, roles, contractors vs employees, firing
- Product: features, roadmap, build vs buy, technical architecture  
- Pricing: pricing model, tiers, discounts, freemium
- Growth: marketing, channels, partnerships, expansion
- Fundraising: raising capital, investors, valuations, terms
- Operations: processes, tools, office, legal, finance
- Pivot: direction changes, business model shifts, market changes
- Complexity: Low = reversible in days, Medium = takes weeks to undo, High = irreversible or major commitment
- Risk: consider runway impact, market position, team morale`;

export async function classifyDecision(
  title: string,
  context?: string
): Promise<DecisionClassification> {
  const input = context ? `Decision: ${title}\nContext: ${context}` : `Decision: ${title}`;

  try {
    const openai = getAIClient();
    const response = await openai.chat.completions.create({
      model: getModel("fast"),
      messages: [
        { role: "system", content: CLASSIFIER_PROMPT },
        { role: "user", content: input },
      ],
      temperature: 0,
      max_tokens: 200,
      ...(supportsJsonMode() ? { response_format: { type: "json_object" as const } } : {}),
    });

    const raw = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw) as DecisionClassification;
    return parsed;
  } catch {
    // Fallback classification
    return {
      decision_type: "Unknown",
      complexity: "Medium",
      time_horizon: "3-6 months",
      risk_level: "Medium",
      category: inferCategoryFromTitle(title),
    };
  }
}

function inferCategoryFromTitle(title: string): string {
  const lower = title.toLowerCase();
  if (/hire|engineer|contractor|employee|team|staff|cto|developer/.test(lower)) return "hiring";
  if (/price|pricing|tier|freemium|charge|monetiz/.test(lower)) return "pricing";
  if (/raise|fund|investor|seed|series|capital|vc/.test(lower)) return "fundraising";
  if (/feature|build|product|launch|roadmap|mvp/.test(lower)) return "product";
  if (/pivot|direction|model|market|change/.test(lower)) return "pivot";
  if (/grow|market|channel|partner|expand/.test(lower)) return "growth";
  return "other";
}
