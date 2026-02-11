import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [totalDecisions, decidedCount, trackingCount, recentDecisions] = await Promise.all([
    prisma.decision.count({ where: { userId } }),
    prisma.decision.count({ where: { userId, status: "decided" } }),
    prisma.decision.count({ where: { userId, status: "tracking" } }),
    prisma.decision.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { messages: true } } },
    }),
  ]);

  const avgRating = await prisma.decision.aggregate({
    where: { userId, outcomeRating: { not: null } },
    _avg: { outcomeRating: true },
  });

  return NextResponse.json({
    totalDecisions,
    decidedCount,
    trackingCount,
    inProgressCount: totalDecisions - decidedCount - trackingCount,
    avgOutcomeRating: avgRating._avg.outcomeRating,
    recentDecisions,
  });
}
