# CofounderAI

An AI-powered decision support platform that helps startup founders make better strategic decisions through structured reasoning, cognitive bias detection, and outcome tracking.

## What is CofounderAI?

CofounderAI acts as your virtual cofounder — not to make decisions for you, but to help you think through them more clearly. It uses a structured reasoning pipeline to:

- **Ask strategic questions** that challenge your assumptions
- **Expose risks and tradeoffs** you might have missed
- **Detect cognitive biases** in your thinking (confirmation bias, sunk cost fallacy, etc.)
- **Organize your reasoning** into a clear decision framework
- **Log decisions** so you can learn from outcomes over time

## Key Features

### Core MVP Features
- ✅ **Secure Authentication** - Email signup/login with NextAuth
- ✅ **Decision Creation Flow** - Structured input with categories (Hiring, Pricing, Product, etc.)
- ✅ **AI Questioning Engine** - Generates probing Socratic questions tailored to your decision
- ✅ **AI Decision Analysis** - Comprehensive structured analysis with tradeoffs, risks, and recommendations
- ✅ **Decision Journal** - Track all your decisions with status filtering
- ✅ **Status Tracking** - Full lifecycle: questioning → deciding → tracking → completed
- ✅ **Analytics Dashboard** - Decision metrics, outcome ratings, and business metrics tracking

### Advanced Features
- **Multi-Provider AI Support** - Ollama (local), OpenAI, Anthropic, Google Gemini, Groq, OpenRouter, or custom endpoints
- **Cognitive Bias Detection** - Identifies 7 common founder biases
- **Founder Personality Profiling** - Adapts questions and analysis to your decision-making style
- **Outcome Tracking** - Record what actually happened and learn from your decisions
- **Voice Input** - Speak your answers using speech-to-text
- **Business Metrics** - Track MRR, burn rate, runway, and custom metrics
- **Beautiful Glassmorphic UI** - Calm, distraction-free interface inspired by Apple VisionOS

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or use a free cloud database like [Neon](https://neon.tech) or [Supabase](https://supabase.com))
- (Optional) [Ollama](https://ollama.com) for local AI (no API keys needed)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/atreyakamat/cofound.ai.git
   cd cofound.ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your configuration (see [SETUP.md](SETUP.md) for detailed instructions).

4. **Set up the database**
   ```bash
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## AI Provider Configuration

CofounderAI supports 7 AI providers with a **local-first philosophy**. Ollama is the default — run AI models on your own machine with zero API costs and complete privacy.

### Option A: Ollama (Recommended - Local & Free)
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model
ollama pull llama3.2

# Configure .env
AI_PROVIDER="ollama"
OLLAMA_BASE_URL="http://localhost:11434/v1"
OLLAMA_FAST_MODEL="llama3.2"
OLLAMA_REASONING_MODEL="llama3.2"
```

### Option B: Anthropic Claude
```env
AI_PROVIDER="anthropic"
ANTHROPIC_API_KEY="sk-ant-..."
```

### Option C: OpenAI
```env
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
```

### Other Options
- **Google Gemini** - Fast, generous free tier
- **Groq** - Ultra-fast open model inference
- **OpenRouter** - Access 100+ models with one API key
- **Custom** - Any OpenAI-compatible endpoint (LM Studio, vLLM, etc.)

See [SETUP.md](SETUP.md) for complete configuration details.

## Project Structure

```
cofound.ai/
├── app/                      # Next.js 14 app directory
│   ├── (auth)/              # Authentication pages (login, register)
│   ├── (app)/               # Protected app pages
│   │   ├── dashboard/       # Dashboard with decision stats
│   │   ├── decisions/       # Decision journal and detail pages
│   │   └── metrics/         # Business metrics tracking
│   └── api/                 # API routes
│       ├── auth/            # NextAuth endpoints
│       ├── decisions/       # Decision CRUD and AI endpoints
│       └── user/            # User profile and personality
├── components/              # Reusable React components
├── lib/                     # Core business logic
│   ├── decision-engine/     # AI reasoning pipeline
│   │   ├── classifier.ts
│   │   ├── questionEngine.ts
│   │   ├── contextBuilder.ts
│   │   ├── biasDetector.ts
│   │   ├── reasoningEngine.ts
│   │   └── analysisGenerator.ts
│   ├── ai-client.ts         # Unified AI client for all providers
│   └── auth.ts              # NextAuth configuration
├── prisma/                  # Database schema and migrations
└── __tests__/               # Jest test suite
```

## Decision Engine Architecture

CofounderAI uses a sophisticated multi-stage reasoning pipeline:

```
User creates decision
        ↓
  classifyDecision()          ← Categorizes decision type, complexity, risk
  generateInitialQuestions()  ← Generates Socratic questions
        ↓
  Conversation loop
  getReasoningResponse()      ← Multi-turn AI conversation
        ↓
  User requests analysis
        ↓
  buildReasoningContext()     ← Extracts goals, constraints, assumptions
  detectBiases()              ← Identifies cognitive biases
        ↓
  generateStructuredAnalysis() ← Produces full structured analysis
        ↓
  AnalysisCard renders result in UI
```

## Testing

All AI API calls are mocked in tests — no API keys required.

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Test suite includes:
- AI client provider detection and model selection
- Decision classification
- Question generation
- Bias detection
- Analysis generation

## Deployment

### Build for Production
```bash
npm run build
npm start
```

### Recommended Platforms
- **Vercel** - Zero-config deployment for Next.js (recommended)
- **Railway** - Deploy + PostgreSQL in one place
- **Fly.io** - More control with Docker
- **Render** - Free tier available

See the [deployment guide](SETUP.md#6-build-for-production) for detailed instructions.

## Database Schema

- **User** - Authentication + company context + personality profile
- **Decision** - Full decision lifecycle with AI analysis and outcomes
- **Message** - Conversation history between user and AI
- **Metric** - Business metrics tracking (MRR, burn rate, etc.)
- **FounderInsight** - Cross-decision pattern insights
- **DecisionTag** - Custom tags for organizing decisions

## Security

- HTTPS enforced in production
- Passwords hashed with bcrypt
- JWT-based session management
- Per-user data isolation in all queries
- Environment variable secrets
- No hardcoded credentials

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **AI**: Multi-provider support (Ollama, OpenAI, Anthropic, etc.)
- **Deployment**: Vercel (recommended)

## Documentation

- [SETUP.md](SETUP.md) - Detailed setup and configuration guide
- [prd.md](prd.md) - Product requirements document
- [design.md](design.md) - UI/UX design system
- [techstack.md](techstack.md) - Technical architecture details

## Development Commands

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm start             # Run production build
npm test              # Run test suite
npm run lint          # Lint code
npx prisma studio     # Open database GUI
npx prisma db push    # Push schema changes to database
npm run db:seed       # Seed database with demo data
```

## Product Philosophy

CofounderAI follows three core principles:

1. **AI improves thinking, not replaces thinking** - You make the decisions
2. **Structured reasoning beats free-form chat** - Systematic approach to complex decisions
3. **Learning compounds over time** - Track outcomes to improve future decisions

## Contributing

This is a personal project by [Atreya Kamat](https://github.com/atreyakamat). If you find bugs or have suggestions, feel free to open an issue.

## License

This project is private and not licensed for distribution.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

Built with ❤️ to help founders make better decisions.
