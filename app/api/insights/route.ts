import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/insights
 * Fetch founder insights (AI-discovered patterns across decisions).
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const insights = await prisma.founderInsight.findMany({
    where: { userId: session.user.id, dismissed: false },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(insights);
}

/**
 * PATCH /api/insights?id=xxx
 * Dismiss an insight.
 */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, dismissed } = body;

  if (!id)
    return NextResponse.json({ error: "Insight id is required" }, { status: 400 });

  await prisma.founderInsight.updateMany({
    where: { id, userId: session.user.id },
    data: { dismissed: dismissed ?? true },
  });

  return NextResponse.json({ ok: true });
}
