/**
 * Unified AI client for CofounderAI — multi-provider, Ollama-first.
 *
 * Supported providers (set via AI_PROVIDER env var or auto-detected):
 *
 *   "ollama"      — Local Ollama instance (fully offline, no cost, PRIORITIZED)
 *   "openai"      — OpenAI API
 *   "anthropic"   — Anthropic Claude API (native, no wrapper)
 *   "google"      — Google Gemini via OpenAI-compatible endpoint
 *   "groq"        — Groq (ultra-fast inference for open models)
 *   "openrouter"  — OpenRouter (any model from any provider via one key)
 *   "custom"      — Any OpenAI-compatible endpoint (LM Studio, vLLM, Together, etc.)
 *
 * Model selection:
 *   AI_MODEL_FAST      — classifier, context builder, bias detector
 *   AI_MODEL_REASONING — analysis generator, reasoning engine, question engine
 *
 * Usage:
 *   const raw = await chatCompletion({ task: "reasoning", messages, json: true });
 */
import OpenAI from "openai";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AIProvider =
  | "ollama"
  | "openai"
  | "anthropic"
  | "google"
  | "groq"
  | "openrouter"
  | "custom";

const VALID_PROVIDERS: string[] = [
  "ollama",
  "openai",
  "anthropic",
  "google",
  "groq",
  "openrouter",
  "custom",
];

export interface ChatCompletionOptions {
  /** Which task tier to use — determines model selection. Default: "reasoning" */
  task?: "fast" | "reasoning";
  /** Explicit model override — takes priority over task-based selection */
  model?: string;
  /** Messages array (system / user / assistant) */
  messages: Array<{ role: string; content: string }>;
  /** Sampling temperature. Default: 0.4 */
  temperature?: number;
  /** Max tokens for the response. Default: 2000 */
  maxTokens?: number;
  /** Request structured JSON output (provider-dependent). Default: false */
  json?: boolean;
}

// ─── Provider Detection (local-first) ────────────────────────────────────────

/**
 * Detect which provider to use.
 *
 * Priority order for auto-detection (local-first philosophy):
 *   1. Explicit AI_PROVIDER env var (always wins)
 *   2. Ollama (local first — no cost, no latency, no data leaves machine)
 *   3. Anthropic (ANTHROPIC_API_KEY)
 *   4. Google (GOOGLE_AI_API_KEY or GEMINI_API_KEY)
 *   5. Groq (GROQ_API_KEY)
 *   6. OpenRouter (OPENROUTER_API_KEY)
 *   7. OpenAI (OPENAI_API_KEY)
 *   8. Custom (CUSTOM_AI_BASE_URL)
 *   9. Fallback → ollama (runs locally without config)
 */
export function detectProvider(): AIProvider {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  if (explicit && VALID_PROVIDERS.includes(explicit)) return explicit as AIProvider;

  // Auto-detect, local-first
  if (process.env.OLLAMA_BASE_URL) return "ollama";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY) return "google";
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.CUSTOM_AI_BASE_URL) return "custom";

  // Default to Ollama — works out of the box on localhost
  return "ollama";
}

// ─── Model Selection ─────────────────────────────────────────────────────────

const DEFAULT_MODELS: Record<AIProvider, { fast: string; reasoning: string }> = {
  ollama:      { fast: "llama3.2",                reasoning: "llama3.2" },
  openai:      { fast: "gpt-4o-mini",             reasoning: "gpt-4o" },
  anthropic:   { fast: "claude-3-5-haiku-20241022", reasoning: "claude-sonnet-4-20250514" },
  google:      { fast: "gemini-2.0-flash",        reasoning: "gemini-2.0-flash" },
  groq:        { fast: "llama-3.3-70b-versatile", reasoning: "llama-3.3-70b-versatile" },
  openrouter:  { fast: "openai/gpt-4o-mini",      reasoning: "openai/gpt-4o" },
  custom:      { fast: "default",                  reasoning: "default" },
};

/**
 * Get the model name for a task tier.
 * Resolution order: AI_MODEL_X env > provider-specific env > built-in default
 */
export function getModel(task: "fast" | "reasoning"): string {
  const provider = detectProvider();

  // Universal override
  const envKey = task === "fast" ? "AI_MODEL_FAST" : "AI_MODEL_REASONING";
  if (process.env[envKey]) return process.env[envKey]!;

  // Provider-specific overrides
  const prefix = provider.toUpperCase().replace("-", "_");
  const providerEnv = process.env[`${prefix}_${task.toUpperCase()}_MODEL`]; // e.g. OLLAMA_FAST_MODEL
  if (providerEnv) return providerEnv;

  // Also check legacy env names for backward compat
  if (provider === "openrouter") {
    const legacy = task === "fast"
      ? process.env.OPENROUTER_FAST_MODEL
      : process.env.OPENROUTER_REASONING_MODEL;
    if (legacy) return legacy;
  }

  return DEFAULT_MODELS[provider]?.[task] ?? DEFAULT_MODELS.openai[task];
}

// ─── JSON Mode Support ───────────────────────────────────────────────────────

/**
 * Whether the provider supports `response_format: { type: "json_object" }`.
 * - OpenAI, OpenRouter, Google, Groq: YES (natively)
 * - Ollama: opt-in via OLLAMA_JSON_MODE=true (works on llama3.2+, qwen2.5, mistral)
 * - Anthropic: NO (uses strong system prompts instead — Claude follows JSON instructions reliably)
 * - Custom: opt-in via CUSTOM_AI_JSON_MODE=true
 */
export function supportsJsonMode(): boolean {
  const provider = detectProvider();
  if (provider === "ollama") return process.env.OLLAMA_JSON_MODE === "true";
  if (provider === "anthropic") return false;
  if (provider === "custom") return process.env.CUSTOM_AI_JSON_MODE === "true";
  return true;
}

// ─── Provider Info (for UI / logging) ────────────────────────────────────────

export function getProviderInfo(): { name: string; provider: AIProvider; fastModel: string; reasoningModel: string } {
  const provider = detectProvider();
  const names: Record<AIProvider, string> = {
    ollama: "Ollama (local)",
    openai: "OpenAI",
    anthropic: "Anthropic Claude",
    google: "Google Gemini",
    groq: "Groq",
    openrouter: "OpenRouter",
    custom: "Custom endpoint",
  };
  return {
    name: names[provider],
    provider,
    fastModel: getModel("fast"),
    reasoningModel: getModel("reasoning"),
  };
}

// ─── Unified Chat Completion ─────────────────────────────────────────────────

/**
 * THE primary function for all AI calls.
 * Works identically across all 7 providers — engine modules call this, never the SDK directly.
 *
 * @returns The assistant's response text (string).
 */
export async function chatCompletion(opts: ChatCompletionOptions): Promise<string> {
  const provider = detectProvider();
  const model = opts.model ?? getModel(opts.task ?? "reasoning");
  const temperature = opts.temperature ?? 0.4;
  const maxTokens = opts.maxTokens ?? 2000;

  // Anthropic has a different API — handle natively via fetch
  if (provider === "anthropic") {
    return anthropicCompletion(model, opts.messages, temperature, maxTokens);
  }

  // All other providers are OpenAI-SDK-compatible
  const client = getAIClient();
  const response = await client.chat.completions.create({
    model,
    messages: opts.messages as Parameters<typeof client.chat.completions.create>[0]["messages"],
    temperature,
    max_tokens: maxTokens,
    ...(opts.json && supportsJsonMode()
      ? { response_format: { type: "json_object" as const } }
      : {}),
  });

  return response.choices[0]?.message?.content || "";
}

// ─── Anthropic Native Adapter ────────────────────────────────────────────────

/**
 * Calls Anthropic's /v1/messages API directly via fetch.
 * Translates from our standard messages format to Anthropic's API shape.
 * No @anthropic-ai/sdk dependency needed.
 */
async function anthropicCompletion(
  model: string,
  messages: Array<{ role: string; content: string }>,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is required when AI_PROVIDER=anthropic");
  }

  // Anthropic requires system messages as a top-level `system` param
  const systemParts = messages.filter((m) => m.role === "system").map((m) => m.content);
  const nonSystemMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  // Anthropic requires the first message to be from the user
  // If conversation starts with assistant, prepend a placeholder
  if (nonSystemMessages.length > 0 && nonSystemMessages[0].role === "assistant") {
    nonSystemMessages.unshift({ role: "user", content: "(continuing conversation)" });
  }

  const body: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    messages: nonSystemMessages,
  };

  if (systemParts.length > 0) {
    body.system = systemParts.join("\n\n---\n\n");
  }
  if (temperature !== undefined) {
    body.temperature = temperature;
  }

  const baseUrl = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";
  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  // Anthropic returns content as array: [{ type: "text", text: "..." }]
  const textBlock = data.content?.find((b: { type: string }) => b.type === "text");
  return textBlock?.text || "";
}

// ─── OpenAI-Compatible Client Factory ────────────────────────────────────────

/**
 * Returns an OpenAI SDK client configured for the active provider.
 * Used by chatCompletion() for all non-Anthropic providers.
 * Can also be used directly for advanced use cases (streaming, etc.).
 */
export function getAIClient(): OpenAI {
  const provider = detectProvider();

  if (provider === "ollama") {
    const baseURL = process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1";
    return new OpenAI({ apiKey: "ollama", baseURL });
  }

  if (provider === "google") {
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY (or GEMINI_API_KEY) is required when AI_PROVIDER=google");
    return new OpenAI({
      apiKey,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });
  }

  if (provider === "groq") {
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is required when AI_PROVIDER=groq");
    return new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  if (provider === "openrouter") {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is required when AI_PROVIDER=openrouter");
    }
    return new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        "X-Title": "CofounderAI",
      },
    });
  }

  if (provider === "custom") {
    const baseURL = process.env.CUSTOM_AI_BASE_URL;
    if (!baseURL) throw new Error("CUSTOM_AI_BASE_URL is required when AI_PROVIDER=custom");
    return new OpenAI({
      apiKey: process.env.CUSTOM_AI_API_KEY || "no-key",
      baseURL,
    });
  }

  // Default: OpenAI
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required when AI_PROVIDER=openai");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
