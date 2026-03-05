/**
 * Tests for lib/ai-client.ts
 * Verifies provider detection, model selection, client construction,
 * chatCompletion() across all 7 providers, and Anthropic adapter.
 */
import {
  detectProvider,
  getModel,
  supportsJsonMode,
  getAIClient,
  getProviderInfo,
  chatCompletion,
} from "@/lib/ai-client";

// Save original env and restore after each test
const ORIGINAL_ENV = { ...process.env };

/** Set specific env vars for a test, clearing any leftovers from the original env */
function setEnv(vars: Record<string, string | undefined>) {
  process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
  // Delete keys that would interfere with provider auto-detection
  delete process.env.AI_PROVIDER;
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.OLLAMA_BASE_URL;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.GOOGLE_AI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GROQ_API_KEY;
  delete process.env.CUSTOM_AI_BASE_URL;
  delete process.env.CUSTOM_AI_API_KEY;
  delete process.env.CUSTOM_AI_JSON_MODE;
  delete process.env.OPENROUTER_FAST_MODEL;
  delete process.env.OPENROUTER_REASONING_MODEL;
  delete process.env.OLLAMA_FAST_MODEL;
  delete process.env.OLLAMA_REASONING_MODEL;
  delete process.env.OLLAMA_JSON_MODE;
  delete process.env.AI_MODEL_FAST;
  delete process.env.AI_MODEL_REASONING;
  delete process.env.ANTHROPIC_BASE_URL;
  // Apply test-specific vars
  Object.assign(process.env, vars);
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
});

// ─── detectProvider ──────────────────────────────────────────────────────────

describe("detectProvider", () => {
  it("returns ollama as default when no env vars are set (local-first)", () => {
    setEnv({});
    expect(detectProvider()).toBe("ollama");
  });

  it("auto-detects ollama first (local-first priority)", () => {
    setEnv({ OLLAMA_BASE_URL: "http://localhost:11434/v1", OPENAI_API_KEY: "sk-test" });
    expect(detectProvider()).toBe("ollama");
  });

  it("auto-detects anthropic when ANTHROPIC_API_KEY is set", () => {
    setEnv({ ANTHROPIC_API_KEY: "sk-ant-test" });
    expect(detectProvider()).toBe("anthropic");
  });

  it("auto-detects google when GOOGLE_AI_API_KEY is set", () => {
    setEnv({ GOOGLE_AI_API_KEY: "AIza-test" });
    expect(detectProvider()).toBe("google");
  });

  it("auto-detects google when GEMINI_API_KEY is set", () => {
    setEnv({ GEMINI_API_KEY: "AIza-test" });
    expect(detectProvider()).toBe("google");
  });

  it("auto-detects groq when GROQ_API_KEY is set", () => {
    setEnv({ GROQ_API_KEY: "gsk_test" });
    expect(detectProvider()).toBe("groq");
  });

  it("auto-detects openrouter when OPENROUTER_API_KEY is set", () => {
    setEnv({ OPENROUTER_API_KEY: "sk-or-test" });
    expect(detectProvider()).toBe("openrouter");
  });

  it("auto-detects openai when OPENAI_API_KEY is set", () => {
    setEnv({ OPENAI_API_KEY: "sk-test" });
    expect(detectProvider()).toBe("openai");
  });

  it("auto-detects custom when CUSTOM_AI_BASE_URL is set", () => {
    setEnv({ CUSTOM_AI_BASE_URL: "http://my-llm:8080/v1" });
    expect(detectProvider()).toBe("custom");
  });

  // Explicit AI_PROVIDER always wins
  it("respects explicit AI_PROVIDER=ollama even if other keys present", () => {
    setEnv({ AI_PROVIDER: "ollama", OPENAI_API_KEY: "sk-test" });
    expect(detectProvider()).toBe("ollama");
  });

  it("respects explicit AI_PROVIDER=anthropic", () => {
    setEnv({ AI_PROVIDER: "anthropic", ANTHROPIC_API_KEY: "sk-ant-test" });
    expect(detectProvider()).toBe("anthropic");
  });

  it("respects explicit AI_PROVIDER=google", () => {
    setEnv({ AI_PROVIDER: "google", GOOGLE_AI_API_KEY: "AIza-test" });
    expect(detectProvider()).toBe("google");
  });

  it("respects explicit AI_PROVIDER=groq", () => {
    setEnv({ AI_PROVIDER: "groq", GROQ_API_KEY: "gsk_test" });
    expect(detectProvider()).toBe("groq");
  });

  it("respects explicit AI_PROVIDER=openrouter", () => {
    setEnv({ AI_PROVIDER: "openrouter", OPENROUTER_API_KEY: "sk-or-test" });
    expect(detectProvider()).toBe("openrouter");
  });

  it("respects explicit AI_PROVIDER=openai", () => {
    setEnv({ AI_PROVIDER: "openai", OPENAI_API_KEY: "sk-test" });
    expect(detectProvider()).toBe("openai");
  });

  it("respects explicit AI_PROVIDER=custom", () => {
    setEnv({ AI_PROVIDER: "custom", CUSTOM_AI_BASE_URL: "http://localhost:8080/v1" });
    expect(detectProvider()).toBe("custom");
  });

  // Priority: Ollama > Anthropic > Google > Groq > OpenRouter > OpenAI
  it("prioritizes ollama over anthropic in auto-detection", () => {
    setEnv({ OLLAMA_BASE_URL: "http://localhost:11434/v1", ANTHROPIC_API_KEY: "sk-ant-test" });
    expect(detectProvider()).toBe("ollama");
  });

  it("prioritizes anthropic over openai in auto-detection", () => {
    setEnv({ ANTHROPIC_API_KEY: "sk-ant-test", OPENAI_API_KEY: "sk-test" });
    expect(detectProvider()).toBe("anthropic");
  });

  it("prioritizes openrouter over openai in auto-detection", () => {
    setEnv({ OPENROUTER_API_KEY: "sk-or-test", OPENAI_API_KEY: "sk-test" });
    expect(detectProvider()).toBe("openrouter");
  });
});

// ─── getModel ────────────────────────────────────────────────────────────────

describe("getModel", () => {
  // Default models per provider
  it("returns gpt-4o-mini / gpt-4o for openai", () => {
    setEnv({ AI_PROVIDER: "openai", OPENAI_API_KEY: "sk-test" });
    expect(getModel("fast")).toBe("gpt-4o-mini");
    expect(getModel("reasoning")).toBe("gpt-4o");
  });

  it("returns llama3.2 for ollama", () => {
    setEnv({ AI_PROVIDER: "ollama" });
    expect(getModel("fast")).toBe("llama3.2");
    expect(getModel("reasoning")).toBe("llama3.2");
  });

  it("returns claude models for anthropic", () => {
    setEnv({ AI_PROVIDER: "anthropic", ANTHROPIC_API_KEY: "sk-ant-test" });
    expect(getModel("fast")).toBe("claude-3-5-haiku-20241022");
    expect(getModel("reasoning")).toBe("claude-sonnet-4-20250514");
  });

  it("returns gemini-2.0-flash for google", () => {
    setEnv({ AI_PROVIDER: "google", GOOGLE_AI_API_KEY: "test" });
    expect(getModel("fast")).toBe("gemini-2.0-flash");
    expect(getModel("reasoning")).toBe("gemini-2.0-flash");
  });

  it("returns llama-3.3-70b-versatile for groq", () => {
    setEnv({ AI_PROVIDER: "groq", GROQ_API_KEY: "test" });
    expect(getModel("fast")).toBe("llama-3.3-70b-versatile");
    expect(getModel("reasoning")).toBe("llama-3.3-70b-versatile");
  });

  it("returns openai-prefixed models for openrouter", () => {
    setEnv({ AI_PROVIDER: "openrouter", OPENROUTER_API_KEY: "sk-or-test" });
    expect(getModel("fast")).toBe("openai/gpt-4o-mini");
    expect(getModel("reasoning")).toBe("openai/gpt-4o");
  });

  // Universal override
  it("respects AI_MODEL_FAST override for any provider", () => {
    setEnv({ AI_PROVIDER: "openai", OPENAI_API_KEY: "sk-test", AI_MODEL_FAST: "gpt-3.5-turbo" });
    expect(getModel("fast")).toBe("gpt-3.5-turbo");
  });

  it("respects AI_MODEL_REASONING override for any provider", () => {
    setEnv({ AI_PROVIDER: "openrouter", OPENROUTER_API_KEY: "sk-or-test", AI_MODEL_REASONING: "anthropic/claude-3-5-sonnet" });
    expect(getModel("reasoning")).toBe("anthropic/claude-3-5-sonnet");
  });

  // Provider-specific overrides
  it("respects OPENROUTER_FAST_MODEL override", () => {
    setEnv({ AI_PROVIDER: "openrouter", OPENROUTER_API_KEY: "sk-or-test", OPENROUTER_FAST_MODEL: "anthropic/claude-3-haiku" });
    expect(getModel("fast")).toBe("anthropic/claude-3-haiku");
  });

  it("respects OLLAMA_REASONING_MODEL override", () => {
    setEnv({ AI_PROVIDER: "ollama", OLLAMA_REASONING_MODEL: "qwen2.5:32b" });
    expect(getModel("reasoning")).toBe("qwen2.5:32b");
  });
});

// ─── supportsJsonMode ────────────────────────────────────────────────────────

describe("supportsJsonMode", () => {
  it("returns true for openai provider", () => {
    setEnv({ AI_PROVIDER: "openai", OPENAI_API_KEY: "sk-test" });
    expect(supportsJsonMode()).toBe(true);
  });

  it("returns true for openrouter provider", () => {
    setEnv({ AI_PROVIDER: "openrouter", OPENROUTER_API_KEY: "sk-or-test" });
    expect(supportsJsonMode()).toBe(true);
  });

  it("returns true for google provider", () => {
    setEnv({ AI_PROVIDER: "google", GOOGLE_AI_API_KEY: "test" });
    expect(supportsJsonMode()).toBe(true);
  });

  it("returns true for groq provider", () => {
    setEnv({ AI_PROVIDER: "groq", GROQ_API_KEY: "test" });
    expect(supportsJsonMode()).toBe(true);
  });

  it("returns false for ollama provider by default", () => {
    setEnv({ AI_PROVIDER: "ollama" });
    expect(supportsJsonMode()).toBe(false);
  });

  it("returns true for ollama when OLLAMA_JSON_MODE=true", () => {
    setEnv({ AI_PROVIDER: "ollama", OLLAMA_JSON_MODE: "true" });
    expect(supportsJsonMode()).toBe(true);
  });

  it("returns false for anthropic (uses prompt-based JSON)", () => {
    setEnv({ AI_PROVIDER: "anthropic", ANTHROPIC_API_KEY: "sk-ant-test" });
    expect(supportsJsonMode()).toBe(false);
  });

  it("returns false for custom by default", () => {
    setEnv({ AI_PROVIDER: "custom", CUSTOM_AI_BASE_URL: "http://localhost:8080/v1" });
    expect(supportsJsonMode()).toBe(false);
  });

  it("returns true for custom when CUSTOM_AI_JSON_MODE=true", () => {
    setEnv({ AI_PROVIDER: "custom", CUSTOM_AI_BASE_URL: "http://localhost:8080/v1", CUSTOM_AI_JSON_MODE: "true" });
    expect(supportsJsonMode()).toBe(true);
  });
});

// ─── getAIClient ─────────────────────────────────────────────────────────────

describe("getAIClient", () => {
  it("throws when OPENAI_API_KEY is missing for openai provider", () => {
    setEnv({ AI_PROVIDER: "openai" });
    expect(() => getAIClient()).toThrow("OPENAI_API_KEY is required");
  });

  it("throws when OPENROUTER_API_KEY is missing for openrouter provider", () => {
    setEnv({ AI_PROVIDER: "openrouter" });
    expect(() => getAIClient()).toThrow("OPENROUTER_API_KEY is required");
  });

  it("throws when GOOGLE_AI_API_KEY is missing for google provider", () => {
    setEnv({ AI_PROVIDER: "google" });
    expect(() => getAIClient()).toThrow("GOOGLE_AI_API_KEY");
  });

  it("throws when GROQ_API_KEY is missing for groq provider", () => {
    setEnv({ AI_PROVIDER: "groq" });
    expect(() => getAIClient()).toThrow("GROQ_API_KEY is required");
  });

  it("throws when CUSTOM_AI_BASE_URL is missing for custom provider", () => {
    setEnv({ AI_PROVIDER: "custom" });
    expect(() => getAIClient()).toThrow("CUSTOM_AI_BASE_URL is required");
  });

  it("does not throw for ollama provider (no key needed)", () => {
    setEnv({ AI_PROVIDER: "ollama" });
    expect(() => getAIClient()).not.toThrow();
  });

  it("creates an OpenAI client with correct baseURL for ollama", () => {
    setEnv({ AI_PROVIDER: "ollama", OLLAMA_BASE_URL: "http://myserver:11434/v1" });
    const client = getAIClient();
    expect((client as any).baseURL).toContain("myserver:11434");
  });

  it("creates an OpenAI client with Google Gemini baseURL", () => {
    setEnv({ AI_PROVIDER: "google", GOOGLE_AI_API_KEY: "test-key" });
    const client = getAIClient();
    expect((client as any).baseURL).toContain("generativelanguage.googleapis.com");
  });

  it("creates an OpenAI client with Groq baseURL", () => {
    setEnv({ AI_PROVIDER: "groq", GROQ_API_KEY: "gsk_test" });
    const client = getAIClient();
    expect((client as any).baseURL).toContain("api.groq.com");
  });

  it("creates an OpenAI client with custom baseURL", () => {
    setEnv({ AI_PROVIDER: "custom", CUSTOM_AI_BASE_URL: "http://my-llm:8080/v1" });
    const client = getAIClient();
    expect((client as any).baseURL).toContain("my-llm:8080");
  });
});

// ─── getProviderInfo ─────────────────────────────────────────────────────────

describe("getProviderInfo", () => {
  it("returns correct info for ollama", () => {
    setEnv({ AI_PROVIDER: "ollama" });
    const info = getProviderInfo();
    expect(info.name).toBe("Ollama (local)");
    expect(info.provider).toBe("ollama");
    expect(info.fastModel).toBe("llama3.2");
    expect(info.reasoningModel).toBe("llama3.2");
  });

  it("returns correct info for anthropic", () => {
    setEnv({ AI_PROVIDER: "anthropic", ANTHROPIC_API_KEY: "sk-ant-test" });
    const info = getProviderInfo();
    expect(info.name).toBe("Anthropic Claude");
    expect(info.provider).toBe("anthropic");
    expect(info.fastModel).toContain("claude");
  });

  it("returns correct info for google", () => {
    setEnv({ AI_PROVIDER: "google", GOOGLE_AI_API_KEY: "test" });
    const info = getProviderInfo();
    expect(info.name).toBe("Google Gemini");
    expect(info.fastModel).toContain("gemini");
  });
});

// ─── chatCompletion ──────────────────────────────────────────────────────────

describe("chatCompletion", () => {
  it("throws when anthropic key is missing", async () => {
    setEnv({ AI_PROVIDER: "anthropic" });
    await expect(
      chatCompletion({ messages: [{ role: "user", content: "hello" }] })
    ).rejects.toThrow("ANTHROPIC_API_KEY is required");
  });
});
