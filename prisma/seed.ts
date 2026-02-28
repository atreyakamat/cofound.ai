import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@cofound.ai" },
    update: {},
    create: {
      name: "Demo Founder",
      email: "demo@cofound.ai",
      hashedPassword,
      companyName: "Demo Startup",
      industry: "SaaS",
      stage: "seed",
      teamSize: 3,
      personalityType: "aggressive_builder",
      riskTolerance: "high",
      decisionSpeed: "fast",
      onboardingCompleted: true,
    },
  });

  // Seed a sample decision with full lifecycle
  const decision = await prisma.decision.upsert({
    where: { id: "seed-decision-1" },
    update: {},
    create: {
      id: "seed-decision-1",
      title: "Should I hire a full-time engineer or keep using contractors?",
      context:
        "We have 14 months of runway, $12K MRR growing 18% MoM. Contractors are delivering but slow and don't know the codebase well.",
      category: "hiring",
      urgency: "medium",
      horizon: "short_term",
      status: "decided",
      finalDecision: "Hire full-time after closing current sprint milestone.",
      aiQuestions: JSON.stringify({
        opening:
          "Let me work through this hiring decision with you. Before I share my view, I need to understand the full picture.",
        questions: [
          "If this hire doesn't work out in 90 days, what's the blast radius on your runway and team morale?",
          "What is the actual blocker right now that makes this urgent today vs. in 3 months?",
          "Do you have defined 30/60/90-day outcomes for this role written down?",
        ],
        question_count: 3,
      }),
      decidedAt: new Date(),
      userId: user.id,
      messages: {
        create: [
          {
            role: "user",
            content:
              "Should I hire a full-time engineer or keep using contractors?\n\nContext: We have 14 months runway, $12K MRR growing 18% MoM.",
          },
          {
            role: "assistant",
            content:
              "Let me work through this hiring decision with you.\n\n**1. If this hire doesn't work out in 90 days, what's the blast radius on your runway and team morale?**\n\n**2. What is the actual blocker right now that makes this urgent today vs. in 3 months?**\n\n**3. Do you have defined 30/60/90-day outcomes for this role written down?**\n\n*Take your time answering. When you're ready for full analysis, just say \"analyze\".*",
          },
        ],
      },
    },
  });

  // Seed sample metrics
  const metricData = [
    { name: "mrr", value: 12000, unit: "$", period: "2026-02" },
    { name: "mrr", value: 10200, unit: "$", period: "2026-01" },
    { name: "burn_rate", value: 8500, unit: "$", period: "2026-02" },
    { name: "runway", value: 14, unit: "months", period: "2026-02" },
    { name: "customers", value: 42, unit: "count", period: "2026-02" },
  ];
  for (const m of metricData) {
    await prisma.metric.create({
      data: { ...m, userId: user.id },
    });
  }

  // Seed a founder insight
  await prisma.founderInsight.upsert({
    where: { id: "seed-insight-1" },
    update: {},
    create: {
      id: "seed-insight-1",
      type: "pattern",
      title: "You tend to decide hiring questions faster than product questions",
      body: "Across your decisions, hiring-related choices are finalized in ~2 messages while product decisions average 6+ exchanges. Consider whether you're applying the same rigour to team decisions.",
      severity: "info",
      userId: user.id,
    },
  });

  console.log("Seeded user:", user.email);
  console.log("Seeded decision:", decision.id);
  console.log("Seeded metrics and insights.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
