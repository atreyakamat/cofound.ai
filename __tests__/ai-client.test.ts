/**
 * Tests for lib/ai-client.ts
 * Verifies provider detection, model selection, and client construction.
 */
import { detectProvider, getModel, supportsJsonMode, getAIClient } from "@/lib/ai-client";

// Save original env and restore after each test
const ORIGINAL_ENV = { ...process.env };

/** Set specific env vars for a test, clearing any leftovers from the original env */
function setEnv(vars: Record<string, string | undefined>) {
  // Start from a clean base (Node always needs NODE_ENV)
  process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
  // Delete keys that would interfere with provider auto-detection
  delete process.env.AI_PROVIDER;
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.OLLAMA_BASE_URL;
  delete process.env.OPENROUTER_FAST_MODEL;
  delete process.env.OPENROUTER_REASONING_MODEL;
  delete process.env.OLLAMA_FAST_MODEL;
  delete process.env.OLLAMA_REASONING_MODEL;
  delete process.env.OLLAMA_JSON_MODE;
  delete process.env.AI_MODEL_FAST;
  delete process.env.AI_MODEL_REASONING;
  // Apply test-specific vars
  Object.assign(process.env, vars);
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
});

// ─── detectProvider ──────────────────────────────────────────────────────────

describe("detectProvider", () => {
  it("returns openai when OPENAI_API_KEY is set and no other keys present", () => {
    setEnv({ OPENAI_API_KEY: "sk-test" });
    expect(detectProvider()).toBe("openai");
  });

  it("returns openrouter when OPENROUTER_API_KEY is present", () => {
    setEnv({ OPENROUTER_API_KEY: "sk-or-test" });
    expect(detectProvider()).toBe("openrouter");
  });

  it("returns ollama when OLLAMA_BASE_URL is present", () => {
    setEnv({ OLLAMA_BASE_URL: "http://localhost:11434/v1" });
    expect(detectProvider()).toBe("ollama");
  });

  it("respects explicit AI_PROVIDER=ollama even if other keys present", () => {
    setEnv({ AI_PROVIDER: "ollama", OPENAI_API_KEY: "sk-test" });
    expect(detectProvider()).toBe("ollama");
  });

  it("respects explicit AI_PROVIDER=openrouter", () => {
    setEnv({ AI_PROVIDER: "openrouter", OPENROUTER_API_KEY: "sk-or-test" });
    expect(detectProvider()).toBe("openrouter");
  });

  it("respects explicit AI_PROVIDER=openai", () => {
    setEnv({ AI_PROVIDER: "openai", OPENAI_API_KEY: "sk-test" });
    expect(detectProvider()).toBe("openai");
  });

  it("prefers openrouter over ollama when both keys present (OPENROUTER_API_KEY takes priority)", () => {
    setEnv({ OPENROUTER_API_KEY: "sk-or-test", OLLAMA_BASE_URL: "http://localhost:11434/v1" });
    expect(detectProvider()).toBe("openrouter");
  });
});

// ─── getModel ────────────────────────────────────────────────────────────────

describe("getModel", () => {
  it("returns gpt-4o-mini as default fast model for openai", () => {
    setEnv({ AI_PROVIDER: "openai", OPENAI_API_KEY: "sk-test" });
    expect(getModel("fast")).toBe("gpt-4o-mini");
  });

  it("returns gpt-4o as default reasoning model for openai", () => {
    setEnv({ AI_PROVIDER: "openai", OPENAI_API_KEY: "sk-test" });
    expect(getModel("reasoning")).toBe("gpt-4o");
  });

  it("returns openai-prefixed models for openrouter provider", () => {
    setEnv({ AI_PROVIDER: "openrouter", OPENROUTER_API_KEY: "sk-or-test" });
    expect(getModel("fast")).toBe("openai/gpt-4o-mini");
    expect(getModel("reasoning")).toBe("openai/gpt-4o");
  });

  it("returns llama3.2 as default for ollama provider", () => {
    setEnv({ AI_PROVIDER: "ollama" });
    expect(getModel("fast")).toBe("llama3.2");
    expect(getModel("reasoning")).toBe("llama3.2");
  });

  it("respects AI_MODEL_FAST override for any provider", () => {
    setEnv({ AI_PROVIDER: "openai", OPENAI_API_KEY: "sk-test", AI_MODEL_FAST: "gpt-3.5-turbo" });
    expect(getModel("fast")).toBe("gpt-3.5-turbo");
  });

  it("respects AI_MODEL_REASONING override for any provider", () => {
    setEnv({ AI_PROVIDER: "openrouter", OPENROUTER_API_KEY: "sk-or-test", AI_MODEL_REASONING: "anthropic/claude-3-5-sonnet" });
    expect(getModel("reasoning")).toBe("anthropic/claude-3-5-sonnet");
  });

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
    process.env = { AI_PROVIDER: "openai", OPENAI_API_KEY: "sk-test" };
    expect(supportsJsonMode()).toBe(true);
  });

  it("returns true for openrouter provider", () => {
    process.env = { AI_PROVIDER: "openrouter", OPENROUTER_API_KEY: "sk-or-test" };
    expect(supportsJsonMode()).toBe(true);
  });

  it("returns false for ollama provider by default", () => {
    process.env = { AI_PROVIDER: "ollama" };
    expect(supportsJsonMode()).toBe(false);
  });

  it("returns true for ollama when OLLAMA_JSON_MODE=true", () => {
    process.env = { AI_PROVIDER: "ollama", OLLAMA_JSON_MODE: "true" };
    expect(supportsJsonMode()).toBe(true);
  });
});

// ─── getAIClient ─────────────────────────────────────────────────────────────

describe("getAIClient", () => {
  it("throws when OPENAI_API_KEY is missing for openai provider", () => {
    process.env = { AI_PROVIDER: "openai" };
    expect(() => getAIClient()).toThrow("OPENAI_API_KEY is required");
  });

  it("throws when OPENROUTER_API_KEY is missing for openrouter provider", () => {
    process.env = { AI_PROVIDER: "openrouter" };
    expect(() => getAIClient()).toThrow("OPENROUTER_API_KEY is required");
  });

  it("does not throw for ollama provider (no key needed)", () => {
    process.env = { AI_PROVIDER: "ollama" };
    expect(() => getAIClient()).not.toThrow();
  });

  it("creates an OpenAI client with correct baseURL for ollama", () => {
    process.env = { AI_PROVIDER: "ollama", OLLAMA_BASE_URL: "http://myserver:11434/v1" };
    const client = getAIClient();
    // The baseURL should point to our Ollama instance
    expect((client as any).baseURL).toContain("myserver:11434");
  });
});
