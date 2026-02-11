import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";
import { getInitialQuestion } from "@/lib/ai";

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");

  const where: any = { userId };
  if (status) where.status = status;
  if (category) where.category = category;

  const decisions = await prisma.decision.findMany({
    where,
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 1 },
      _count: { select: { messages: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(decisions);
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, context, category } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const initialMessage = getInitialQuestion(title, context);

  const decision = await prisma.decision.create({
    data: {
      title,
      context,
      category: category || "other",
      userId,
      messages: {
        create: [
          { role: "user", content: context ? `${title}\n\nContext: ${context}` : title },
          { role: "assistant", content: initialMessage },
        ],
      },
    },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json(decision, { status: 201 });
}
