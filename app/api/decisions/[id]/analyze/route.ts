import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAnalysis, type ChatMessage } from "@/lib/ai";

export async function POST(
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

  const conversationHistory: ChatMessage[] = decision.messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const analysis = await generateAnalysis(decision.title, conversationHistory);

  // Save analysis message and update decision
  await prisma.message.create({
    data: {
      role: "assistant",
      content: analysis,
      decisionId: decision.id,
    },
  });

  const updated = await prisma.decision.update({
    where: { id: decision.id },
    data: {
      aiAnalysis: analysis,
      status: "decided",
      decidedAt: new Date(),
    },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json(updated);
}
