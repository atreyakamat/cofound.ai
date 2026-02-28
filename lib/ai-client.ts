/**
 * Unified AI client factory for CofounderAI.
 *
 * Supported providers (set via AI_PROVIDER env var or detected automatically):
 *   "openai"      — OpenAI API (default)
 *   "openrouter"  — OpenRouter (any model from any provider via one API)
 *   "ollama"      — Local Ollama instance (fully offline / free)
 *
 * Model selection:
 *   AI_MODEL_FAST      — used for classifier, context builder, bias detector
 *   AI_MODEL_REASONING — used for reasoning engine and analysis generator
 *
 * All three providers are OpenAI-SDK-compatible via baseURL override.
 */
import OpenAI from "openai";

export type AIProvider = "openai" | "openrouter" | "ollama";

/** Detect which provider to use based on environment variables */
export function detectProvider(): AIProvider {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  if (explicit === "ollama") return "ollama";
  if (explicit === "openrouter") return "openrouter";
  if (explicit === "openai") return "openai";

  // Auto-detect
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  if (process.env.OLLAMA_BASE_URL) return "ollama";
  return "openai";
}

/**
 * Get the model name for a specific task type.
 * All lookups are lazy (read at call time) so env vars set after import are respected.
 * Priority: AI_MODEL_FAST/REASONING > provider-specific override > built-in default
 */
export function getModel(task: "fast" | "reasoning"): string {
  const provider = detectProvider();

  if (task === "fast") {
    if (process.env.AI_MODEL_FAST) return process.env.AI_MODEL_FAST;
    if (provider === "openrouter") return process.env.OPENROUTER_FAST_MODEL || "openai/gpt-4o-mini";
    if (provider === "ollama") return process.env.OLLAMA_FAST_MODEL || "llama3.2";
    return "gpt-4o-mini";
  }

  // reasoning
  if (process.env.AI_MODEL_REASONING) return process.env.AI_MODEL_REASONING;
  if (provider === "openrouter") return process.env.OPENROUTER_REASONING_MODEL || "openai/gpt-4o";
  if (provider === "ollama") return process.env.OLLAMA_REASONING_MODEL || "llama3.2";
  return "gpt-4o";
}

/**
 * Returns true if the active provider/model combo supports `response_format: { type: "json_object" }`.
 * For Ollama, opt-in by setting OLLAMA_JSON_MODE=true (e.g., when using llama3.2 or newer).
 */
export function supportsJsonMode(): boolean {
  const provider = detectProvider();
  if (provider === "ollama") {
    return process.env.OLLAMA_JSON_MODE === "true";
  }
  return true; // OpenAI + OpenRouter both support json_object natively
}

/** Create and return an OpenAI-compatible client for the active provider */
export function getAIClient(): OpenAI {
  const provider = detectProvider();

  if (provider === "ollama") {
    const baseURL = process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1";
    return new OpenAI({
      apiKey: "ollama", // Ollama doesn't require an API key — this is a placeholder
      baseURL,
    });
  }

  if (provider === "openrouter") {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error(
        "OPENROUTER_API_KEY is required when AI_PROVIDER=openrouter"
      );
    }
    return new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        // Required by OpenRouter for abuse prevention and rate limit attribution
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        "X-Title": "CofounderAI",
      },
    });
  }

  // Default: OpenAI
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required when AI_PROVIDER=openai");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
