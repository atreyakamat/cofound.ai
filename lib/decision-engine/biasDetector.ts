import { getAIClient, getModel, supportsJsonMode } from "../ai-client";

export interface DetectedBias {
  bias: string;
  signal: string;
  reframe: string;
}

const BIAS_DETECTOR_PROMPT = `You are a cognitive bias detection system for startup decision-making.

Analyze the conversation for these specific biases:

| Bias | Detection Signal |
|------|-----------------|
| Confirmation bias | Founder only references evidence supporting their preferred choice |
| Sunk cost fallacy | Decision is justified by past investment ("we've already spent X on this") |
| Optimism bias | Projections assume best-case outcomes without alternate scenarios |
| Urgency bias | Artificial urgency creating pressure to decide faster than needed |
| Social proof bias | Decision driven by what competitors or other founders are doing |
| Anchoring bias | Over-relying on the first number or option mentioned |
| Authority bias | Deferring to an investor/advisor opinion without own analysis |

Return ONLY valid JSON. Return empty array if no clear biases detected:
{
  "detected_biases": [
    {
      "bias": "Name of bias",
      "signal": "Exact quote or behavior pattern that indicates this bias",
      "reframe": "One sentence that challenges this bias constructively"
    }
  ]
}

Only flag biases where there is clear evidence. Do not hallucinate biases.`;

export async function detectBiases(
  messages: Array<{ role: string; content: string }>
): Promise<DetectedBias[]> {
  // Only look at founder messages
  const founderMessages = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n\n");

  if (founderMessages.length < 100) return []; // Not enough data

  try {
    const openai = getAIClient();
    const response = await openai.chat.completions.create({
      model: getModel("fast"),
      messages: [
        { role: "system", content: BIAS_DETECTOR_PROMPT },
        { role: "user", content: `Founder statements:\n${founderMessages}` },
      ],
      temperature: 0,
      max_tokens: 600,
      ...(supportsJsonMode() ? { response_format: { type: "json_object" as const } } : {}),
    });

    const raw = response.choices[0]?.message?.content || '{"detected_biases":[]}';
    const parsed = JSON.parse(raw);
    return parsed.detected_biases || [];
  } catch {
    return [];
  }
}
