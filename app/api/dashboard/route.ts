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

  const [totalDecisions, decidedCount, trackingCount, recentDecisions] =
    await Promise.all([
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
