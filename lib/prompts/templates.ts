/**
 * QUESTION GENERATION PROMPT
 *
 * Template function. Returns a fully-assembled user prompt
 * for generating 3–5 probing questions about a decision.
 */
export function buildQuestionPrompt(
  decisionDescription: string,
  decisionType: string,
  founderName?: string
): string {
  const nameRef = founderName ? `The founder (${founderName}) is` : "The founder is";
  return `${nameRef} making the following decision:

${decisionDescription}

Decision category: ${decisionType}

Generate 3–5 probing questions that help the founder think more clearly.

Rules:
- Questions must expose missing thinking, not collect surface information.
- Focus on risks, constraints, assumptions, and tradeoffs.
- Avoid questions that can be answered with a simple yes or no.
- Each question must create insight tension — it should make the founder pause.
- Do NOT give advice yet.
- Do NOT explain questions or add context after them.

Good examples:
- "What would have to be true for this to fail despite everything going right?"
- "If you gave yourself 6 more weeks, would the answer change? Why?"
- "Who benefits most if you're wrong about this assumption?"

Return ONLY valid JSON, no markdown, no code blocks:

{
  "questions": [
    "question 1",
    "question 2",
    "question 3"
  ]
}`;
}

/**
 * CONTEXT BUILDER PROMPT
 *
 * Converts raw founder Q&A into a structured reasoning context.
 * Used internally before running the analysis prompt.
 */
export function buildContextPrompt(
  decisionTitle: string,
  conversationHistory: Array<{ role: string; content: string }>
): string {
  const transcript = conversationHistory
    .filter((m) => m.role !== "system")
    .map((m) => `[${m.role.toUpperCase()}]: ${m.content}`)
    .join("\n\n");

  return `Using the conversation below, extract a structured reasoning context for this decision.

Decision: ${decisionTitle}

Conversation:
${transcript}

Identify:
- primary_goal: The real outcome the founder wants to achieve
- constraints: Time, money, team, or resource constraints mentioned
- assumptions: Beliefs the founder is relying on that may be unverified
- risks: Risks mentioned or clearly implied
- unknowns: Critical missing information not discussed

Return ONLY valid JSON, no markdown, no code blocks:

{
  "primary_goal": "",
  "constraints": [],
  "assumptions": [],
  "risks": [],
  "unknowns": []
}`;
}

/**
 * ANALYSIS GENERATION PROMPT (CORE)
 *
 * Full structured decision analysis from decision + context.
 */
export function buildAnalysisPrompt(
  decision: string,
  structuredContext: {
    primary_goal: string;
    constraints: string[];
    assumptions: string[];
    risks: string[];
    unknowns: string[];
  },
  conversationHistory: Array<{ role: string; content: string }>
): string {
  const answers = conversationHistory
    .filter((m) => m.role === "user")
    .slice(1) // skip the initial decision description
    .map((m) => m.content)
    .join("\n\n---\n\n");

  return `You are now performing structured decision analysis.

Decision:
${decision}

Founder responses:
${answers || "No follow-up responses provided."}

Structured context:
${JSON.stringify(structuredContext, null, 2)}

Follow the decision framework strictly (Clarify → Goals → Constraints → Assumptions → Tradeoffs → Risks → Second-order → Recommend).

Produce analysis that helps the founder THINK better, not feel better.
Be honest. Surface uncomfortable truths if the data supports it.

Return ONLY valid JSON, no markdown, no code blocks:

{
  "decision_summary": "1–2 sentence plain summary of what is actually being decided",
  "key_insights": [
    "insight 1 — the most important thing the founder may be missing or underweighting",
    "insight 2",
    "insight 3"
  ],
  "tradeoffs": [
    {
      "option": "Option A label",
      "upside": "What you gain",
      "downside": "What you give up or risk",
      "when_to_choose": "Conditions under which this is clearly right"
    }
  ],
  "risks": [
    {
      "risk": "Risk description",
      "likelihood": "low | medium | high",
      "severity": "low | medium | high",
      "mitigation": "Specific step to reduce this risk"
    }
  ],
  "second_order_effects": [
    "Effect 1 — what happens downstream after this decision that most people don't think about"
  ],
  "recommended_direction": "A clear, honest directional recommendation. Not a hedge.",
  "confidence_reasoning": "Why you have this confidence level — what data or logic supports the recommendation",
  "reflection_question": "One question for the founder to sit with before making the final call"
}`;
}

/**
 * CHAT RESPONSE PROMPT
 *
 * Used for the conversational follow-up after initial questions.
 * Keeps the AI on-track for the current decision.
 */
export function buildChatSystemPrompt(decisionTitle: string, decisionCategory: string): string {
  return `You are CofounderAI, a strategic co-founder thinking partner.

The founder is currently working through this decision:
"${decisionTitle}"
Category: ${decisionCategory}

Your role in this conversation:
1. Ask follow-up questions to deepen understanding.
2. Challenge assumptions exposed in their answers.
3. Surface trade-offs and risks they may not be considering.
4. When you have sufficient context (typically 3–5 exchanges), signal readiness for full analysis.

When you feel you have enough context, end your message with:
"I think I have enough to build a structured analysis. Ready when you are — just say 'analyze'."

Do NOT generate the full analysis in chat. Save it for the /analyze endpoint.
Keep responses concise. 2–4 sentences max per turn unless complexity demands more.`;
}
