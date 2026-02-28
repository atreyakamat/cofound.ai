import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [
    totalDecisions,
    questioningCount,
    decidedCount,
    trackingCount,
    completedCount,
    recentDecisions,
    avgRating,
    user,
    activeInsights,
    categoryBreakdown,
  ] = await Promise.all([
    prisma.decision.count({ where: { userId } }),
    prisma.decision.count({ where: { userId, status: "questioning" } }),
    prisma.decision.count({ where: { userId, status: "decided" } }),
    prisma.decision.count({ where: { userId, status: "tracking" } }),
    prisma.decision.count({ where: { userId, status: "completed" } }),
    prisma.decision.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { messages: true } } },
    }),
    prisma.decision.aggregate({
      where: { userId, outcomeRating: { not: null } },
      _avg: { outcomeRating: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        companyName: true,
        personalityType: true,
        riskTolerance: true,
        onboardingCompleted: true,
      },
    }),
    prisma.founderInsight.count({
      where: { userId, dismissed: false },
    }),
    prisma.decision.groupBy({
      by: ["category"],
      where: { userId },
      _count: true,
    }),
  ]);

  return NextResponse.json({
    user: {
      name: user?.name,
      companyName: user?.companyName,
      personalityType: user?.personalityType,
      riskTolerance: user?.riskTolerance,
      onboardingCompleted: user?.onboardingCompleted,
    },
    stats: {
      totalDecisions,
      questioningCount,
      decidedCount,
      trackingCount,
      completedCount,
      avgOutcomeRating: avgRating._avg.outcomeRating,
      activeInsights,
    },
    categoryBreakdown: categoryBreakdown.map((c) => ({
      category: c.category || "other",
      count: c._count,
    })),
    recentDecisions,
  });
}
