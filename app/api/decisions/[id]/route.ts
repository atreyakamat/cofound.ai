import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decision = await prisma.decision.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!decision) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(decision);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Build update data with proper lifecycle timestamps
  const allowed = [
    "title", "context", "category", "urgency", "horizon",
    "status", "finalDecision", "outcome", "outcomeRating",
  ];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  // Status lifecycle timestamps
  if (data.status === "decided") data.decidedAt = new Date();
  if (data.outcome || data.outcomeRating) data.outcomeTrackedAt = new Date();

  const decision = await prisma.decision.updateMany({
    where: { id: params.id, userId: session.user.id },
    data,
  });

  if (decision.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.decision.findUnique({
    where: { id: params.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      tags: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decision = await prisma.decision.deleteMany({
    where: { id: params.id, userId: session.user.id },
  });

  if (decision.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
