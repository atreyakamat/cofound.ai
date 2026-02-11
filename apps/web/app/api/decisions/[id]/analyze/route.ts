import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";
import { generateAnalysis, type ChatMessage } from "@/lib/ai";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decision = await prisma.decision.findFirst({
    where: { id: params.id, userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!decision) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const history: ChatMessage[] = decision.messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const analysis = await generateAnalysis(decision.title, history);

  await prisma.message.create({ data: { role: "assistant", content: analysis, decisionId: decision.id } });

  const updated = await prisma.decision.update({
    where: { id: decision.id },
    data: { aiAnalysis: analysis, status: "decided", decidedAt: new Date() },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json(updated);
}
