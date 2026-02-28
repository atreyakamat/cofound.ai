import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  classifyDecision,
  generateInitialQuestions,
  formatQuestionsAsMessage,
} from "@/lib/decision-engine";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");

  const where: any = { userId: session.user.id };
  if (status) where.status = status;
  if (category) where.category = category;

  const decisions = await prisma.decision.findMany({
    where,
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 1,
      },
      _count: { select: { messages: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(decisions);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, context, category } = body;

  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  try {
    // Run classifier and question engine in parallel
    const [classification, questionOutput] = await Promise.all([
      classifyDecision(title, context),
      (async () => {
        // We need the category for the question framework — use keyword inference first,
        // then the classifier result will be consistent since both run together
        const inferredCategory = category || "other";
        return generateInitialQuestions(title, context, inferredCategory);
      })(),
    ]);

    const resolvedCategory = classification.category || category || "other";
    const questionsMessage = formatQuestionsAsMessage(questionOutput);

    const decision = await prisma.decision.create({
      data: {
        title,
        context,
        category: resolvedCategory,
        userId: session.user.id,
        messages: {
          create: [
            {
              role: "user",
              content: context ? `${title}\n\nContext: ${context}` : title,
            },
            {
              role: "assistant",
              content: questionsMessage,
            },
          ],
        },
      },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    return NextResponse.json(decision, { status: 201 });
  } catch (error) {
    console.error("[POST /api/decisions]", error);
    return NextResponse.json({ error: "Failed to create decision" }, { status: 500 });
  }
}
