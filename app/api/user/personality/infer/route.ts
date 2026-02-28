import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inferPersonality } from "@/lib/prompts/personality";

/**
 * POST /api/user/personality/infer
 * Re-infer personality from decision history signals.
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // Gather signals from decision history
  const [decisionCount, completedCount, avgRating, oldestDecision, totalMessages] =
    await Promise.all([
      prisma.decision.count({ where: { userId } }),
      prisma.decision.count({ where: { userId, status: "decided" } }),
      prisma.decision.aggregate({
        where: { userId, outcomeRating: { not: null } },
        _avg: { outcomeRating: true },
      }),
      prisma.decision.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
      prisma.message.count({
        where: { decision: { userId }, role: "user" },
      }),
    ]);

  // Calculate months active
  const monthsActive = oldestDecision
    ? Math.max(1, (Date.now() - oldestDecision.createdAt.getTime()) / (30 * 24 * 60 * 60 * 1000))
    : 1;

  const avgDecisionsPerMonth = decisionCount / monthsActive;
  const avgMessagesBeforeDecision = completedCount > 0 ? totalMessages / completedCount : 5;

  const profile = inferPersonality({
    avgDecisionsPerMonth,
    avgMessagesBeforeDecision,
    avgOutcomeRating: avgRating._avg.outcomeRating ?? undefined,
  });

  // Save to user
  await prisma.user.update({
    where: { id: userId },
    data: {
      personalityType: profile.type,
      riskTolerance: profile.riskTolerance,
      decisionSpeed: profile.decisionSpeed,
    },
  });

  return NextResponse.json({
    profile,
    signals: {
      decisionCount,
      avgDecisionsPerMonth: Math.round(avgDecisionsPerMonth * 10) / 10,
      avgMessagesBeforeDecision: Math.round(avgMessagesBeforeDecision * 10) / 10,
      avgOutcomeRating: avgRating._avg.outcomeRating,
    },
  });
}
