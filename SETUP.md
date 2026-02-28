# CofounderAI — Setup & Run Guide

A structured decision-reasoning tool for startup founders. Instead of generic AI chat, it runs a multi-stage pipeline: **classify → probe → analyze → recommend** with cognitive bias detection.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | `node -v` to check |
| npm | 9+ | comes with Node |
| PostgreSQL | 14+ | or use a free cloud DB (see below) |
| Git | any | |

---

## 1. Clone & Install

```bash
git clone <your-repo-url>
cd cofound.ai
npm install
```

---

## 2. Configure Environment

```bash
cp .env.example .env
```

Open `.env` and fill in the required values:

### Required

```dotenv
DATABASE_URL="postgresql://user:password@localhost:5432/cofound_ai"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

**Free PostgreSQL options:**
- [Neon](https://neon.tech) — generous free tier, no credit card
- [Supabase](https://supabase.com) — 500 MB free
- [Railway](https://railway.app) — $5/month free credits

### AI Provider (pick one)

#### Option A — OpenAI (default)
```dotenv
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
```
Get your key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

---

#### Option B — OpenRouter (recommended for flexibility)
One API key gives you access to OpenAI, Anthropic, Google, Meta, Mistral, DeepSeek, and more.

```dotenv
AI_PROVIDER="openrouter"
OPENROUTER_API_KEY="sk-or-..."

# Optional — override which models to use:
OPENROUTER_FAST_MODEL="openai/gpt-4o-mini"       # classifier, context, bias detection
OPENROUTER_REASONING_MODEL="openai/gpt-4o"        # analysis + chat engine
```

Get your key at [openrouter.ai/keys](https://openrouter.ai/keys).

**Popular model combinations for OpenRouter:**

| Use Case | Fast Model | Reasoning Model |
|----------|-----------|-----------------|
| Best quality | `openai/gpt-4o-mini` | `openai/gpt-4o` |
| Budget-friendly | `anthropic/claude-3-haiku` | `anthropic/claude-3-5-sonnet` |
| Latest Google | `google/gemini-2.0-flash` | `google/gemini-2.0-flash-thinking-exp` |
| Open source | `meta-llama/llama-3.3-70b-instruct` | `meta-llama/llama-3.3-70b-instruct` |
| Reasoning specialist | `openai/gpt-4o-mini` | `deepseek/deepseek-r1` |

---

#### Option C — Ollama (fully local, no API cost)

Run AI models on your own machine — 100% private, no API fees.

**Setup:**
```bash
# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh   # macOS/Linux
# or download from https://ollama.com

# 2. Pull a model
ollama pull llama3.2          # 2GB — good for most tasks
# or
ollama pull qwen2.5:7b        # smaller, faster
ollama pull qwen2.5:32b       # larger, better reasoning
ollama pull deepseek-r1:8b    # strong reasoning

# 3. Verify it's running
curl http://localhost:11434/api/tags
```

```dotenv
AI_PROVIDER="ollama"
OLLAMA_BASE_URL="http://localhost:11434/v1"
OLLAMA_FAST_MODEL="llama3.2"
OLLAMA_REASONING_MODEL="llama3.2"

# Enable structured JSON output (supported on llama3.2, qwen2.5, mistral):
OLLAMA_JSON_MODE="true"
```

**Recommended Ollama model pairs:**

| Fast Model | Reasoning Model | RAM Required |
|-----------|-----------------|-------------|
| `llama3.2` | `llama3.2` | 4 GB |
| `qwen2.5:7b` | `qwen2.5:7b` | 6 GB |
| `qwen2.5:7b` | `qwen2.5:32b` | 24 GB |
| `llama3.2` | `deepseek-r1:8b` | 8 GB |

---

### Model Override (any provider)

Force a specific model regardless of provider defaults:
```dotenv
AI_MODEL_FAST="gpt-4o-mini"         # used by classifier, context builder, bias detector
AI_MODEL_REASONING="gpt-4o"         # used by reasoning engine and analysis generator
```

---

## 3. Set Up the Database

```bash
# Create all tables from schema
npx prisma db push

# (Optional) Load demo data
npm run db:seed
```

---

## 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 5. Running Tests

The test suite mocks all AI API calls — no real keys required to run tests.

```bash
# Run all tests
npm test

# Watch mode (re-runs on file save)
npm run test:watch

# With coverage report
npm run test:coverage
```

**Test files:**

| File | What it tests |
|------|--------------|
| `__tests__/ai-client.test.ts` | Provider detection, model selection, client construction |
| `__tests__/classifier.test.ts` | Decision classification, fallback behavior |
| `__tests__/biasDetector.test.ts` | Bias detection, message filtering |
| `__tests__/questionEngine.test.ts` | Question generation, formatting |
| `__tests__/analysisGenerator.test.ts` | Analysis generation, serialization round-trips |

---

## 6. Build for Production

```bash
npm run build
npm start
```

### Environment variables for production

```dotenv
NEXTAUTH_URL="https://yourdomain.com"          # must match your real domain
NODE_ENV="production"
```

### Deploy options

| Platform | Notes |
|---------|-------|
| **Vercel** | Zero-config for Next.js, add env vars in dashboard |
| **Railway** | Deploy + PostgreSQL in one place |
| **Fly.io** | More control, good for Docker deploys |
| **Render** | Free tier available |

---

## 7. Architecture Overview

```
User creates a decision
        ↓
  classifyDecision()          ← gpt-4o-mini / fast model
  generateInitialQuestions()  ← gpt-4o / reasoning model
        ↓
  Conversation loop
  getReasoningResponse()      ← gpt-4o / reasoning model
        ↓
  User requests analysis
        ↓
  buildReasoningContext()     ← gpt-4o-mini / fast model  ┐ parallel
  detectBiases()              ← gpt-4o-mini / fast model  ┘
        ↓
  generateStructuredAnalysis() ← gpt-4o / reasoning model
        ↓
  AnalysisCard renders result in UI
```

**Decision Engine modules** (`lib/decision-engine/`):

| Module | Purpose |
|--------|---------|
| `classifier.ts` | Classifies decision type, complexity, risk |
| `questionEngine.ts` | Generates category-specific Socratic questions |
| `contextBuilder.ts` | Extracts goals, constraints, assumptions from conversation |
| `biasDetector.ts` | Detects 7 cognitive biases in founder reasoning |
| `reasoningEngine.ts` | Drives the conversational probing phase |
| `analysisGenerator.ts` | Produces full structured `StructuredAnalysis` JSON |

**AI client** (`lib/ai-client.ts`):  
Single factory that returns an OpenAI-SDK-compatible client regardless of whether you're using OpenAI, OpenRouter, or Ollama. All engine modules use this — switching providers requires only `.env` changes.

---

## 8. Common Issues

**`Error: OPENAI_API_KEY is required`**  
→ Set `AI_PROVIDER` and the corresponding key in `.env`

**`error TS2305: Module '"@prisma/client"' has no exported member 'PrismaClient'`**  
→ Run `npx prisma generate`

**Ollama: `connection refused`**  
→ Make sure `ollama serve` is running (it starts automatically on macOS after install)

**Ollama: garbled JSON in analysis**  
→ Set `OLLAMA_JSON_MODE=true` — only works with llama3.2, qwen2.5, mistral. For other models, leave it off and the system prompts guide the model to output JSON.

**Port 3000 in use**  
→ Next.js auto-picks 3001. Or: `PORT=3002 npm run dev`
