. Core Philosophy of the Stack

The stack must be:

• fast to build
• easy to scale
• minimal infrastructure
• serverless friendly
• AI-native

Key principle:

Avoid complexity until product-market validation.

2. Complete Technology Stack
Frontend

Framework
• Next.js 14 (App Router)

Language
• TypeScript

UI
• TailwindCSS

Component Library
• shadcn/ui

Form Handling
• React Hook Form

State Management
• Zustand

Markdown Rendering
• react-markdown

Icons
• Lucide React

Notifications
• Sonner

Animation
• Framer Motion

Backend

Backend Pattern
• Next.js API Routes

Runtime
• Node.js

API Layer
• REST endpoints

Data Access
• Prisma ORM

Validation
• Zod

Authentication
• Clerk (recommended) or NextAuth

Database

Database
• PostgreSQL

Hosting
• Supabase

Database Access
• Prisma Client

Connection
• connection pooling via Supabase

AI Layer

Provider
• OpenAI

Model
• GPT-4o

Fallback
• GPT-4.1-mini

SDK
• openai official SDK

Prompt Architecture
• Modular prompt stack

Infrastructure

Hosting
• Vercel

Database Hosting
• Supabase

Environment Secrets
• Vercel env vars

CI/CD
• GitHub + Vercel auto deploy

3. Repository Structure
cofounder-ai/
│
├── app/
│   ├── (auth)/
│   │   ├── login
│   │   └── signup
│   │
│   ├── dashboard
│   │
│   ├── decision
│   │   ├── new
│   │   └── [id]
│   │
│   └── layout.tsx
│
├── components/
│   ├── chat
│   ├── decision
│   ├── ui
│   └── layout
│
├── lib/
│   ├── ai
│   ├── decision-engine
│   ├── prisma
│   └── utils
│
├── api/
│
├── prisma/
│   └── schema.prisma
│
├── hooks/
│
├── types/
│
└── styles/
4. Frontend Architecture

The UI is structured around 3 main experiences.

Dashboard

Displays:

• list of decisions
• quick create button
• status overview

Decision Creation Flow

Components:

DecisionInput
AIQuestions
AnswerForm
AnalysisView

Decision Detail

Displays:

• context
• conversation history
• AI reasoning output

5. Component Structure
UI Components
components/ui

Button
Card
Input
Textarea
Dialog
Badge

Using shadcn components.

Decision Components
components/decision

DecisionCard
DecisionList
DecisionDetail
DecisionStatusBadge

Chat Components
components/chat

ChatBubble
AIQuestionCard
AnswerInput

6. State Management

Use Zustand for global state.

Store structure:

decisionStore
{
 currentDecision
 questions
 answers
 analysis
}

Local component state handled by React.

7. Backend Architecture

Backend implemented through Next.js API routes.

Endpoints:

POST /api/decision
POST /api/questions
POST /api/analysis
GET /api/decisions
GET /api/decision/:id
PATCH /api/decision/:id

Each endpoint handles a specific stage in the decision lifecycle.

8. AI Service Layer

Located at:

/lib/ai

Files:

openaiClient.ts
promptStack.ts
questionGenerator.ts
analysisGenerator.ts
contextBuilder.ts
AI Service Flow
User input
→ questionGenerator
→ user answers
→ contextBuilder
→ analysisGenerator
→ result returned
9. Decision Engine Modules

Located at:

/lib/decision-engine

Modules:

classifier.ts
questionEngine.ts
contextBuilder.ts
reasoningEngine.ts
analysisEngine.ts

Each module performs a single responsibility.

10. Prompt Stack System

Prompts stored in:

/lib/ai/prompts

Files:

systemPrompt.ts
decisionFramework.ts
questionPrompt.ts
analysisPrompt.ts
toneGuardrails.ts

Prompt assembly:

prompt =
systemPrompt
+ framework
+ taskPrompt
+ toneRules
+ userContext
11. Database Design
ORM

Prisma

Schema Location
/prisma/schema.prisma
Tables
User
id
email
createdAt
Decision
id
userId
title
description
category
status
analysis
createdAt
Message

Stores conversation.

id
decisionId
role
content
createdAt
Outcome
id
decisionId
result
lesson
recordedAt
12. Validation Layer

Use Zod for all input validation.

Example:

decisionSchema

Validation happens:

• before API processing
• before DB insertion
• before AI calls

13. Authentication

Recommended: Clerk

Reasons:

• easier setup
• built-in UI
• session management
• server components compatible

Protected routes:

/dashboard
/decision/*
14. API Request Flow

Example decision creation:

User submits decision
→ POST /api/decision
→ decision stored
→ AI questions generated
→ response returned

Analysis flow:

User answers questions
→ POST /api/analysis
→ context builder
→ AI reasoning
→ analysis saved
15. Error Handling

Every API endpoint must:

• validate input
• catch AI errors
• log failures

Error response format:

{
 error: true,
 message: "Something went wrong"
}
16. Logging

Logging library:

pino

Log types:

• API calls
• AI responses
• failures

Logs help improve prompts later.

17. Performance Considerations

AI calls are the slowest part.

Strategies:

• stream responses where possible
• limit context size
• cache prompts

18. Security

Secrets stored in:

.env

Keys:

OPENAI_API_KEY
DATABASE_URL
CLERK_SECRET

Never expose secrets to frontend.

19. Deployment

Deployment platform:

Vercel

Workflow:

Push to GitHub
→ Vercel auto deploy

Environment variables configured in Vercel dashboard.

20. Monitoring

For MVP:

• Vercel logs
• Supabase logs
• manual monitoring

Future upgrade:

• Sentry
• Posthog

21. Cost Estimation

AI cost estimate:

1 decision ≈ 3k tokens

Average cost:

$0.01 – $0.03

100 decisions/month ≈ $3

22. Scaling Plan

When usage grows:

Add:

• Redis caching
• queue system
• vector search

But none needed for MVP.

23. Development Environment

Local setup:

Node 18+
pnpm or npm
PostgreSQL (via Supabase)

Install:

npm install

Run:

npm run dev
24. Definition of Done

System is ready when:

User can

• signup
• create decision
• answer AI questions
• receive reasoning
• save decision
• view decision history

25. Development Order

Recommended build order:

1 Setup Next.js project
2 Setup database + Prisma
3 Implement authentication
4 Build decision creation page
5 Build AI question generation
6 Build analysis engine
7 Build journal view
8 Deploy MVP

26. Future Improvements

Planned upgrades:

• decision similarity search
• decision outcome predictions
• founder thinking profiles
• team collaboration