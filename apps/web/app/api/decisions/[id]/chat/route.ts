import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";
import { getAIResponse, type ChatMessage } from "@/lib/ai";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decision = await prisma.decision.findFirst({
    where: { id: params.id, userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!decision) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { message } = await req.json();
  if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  await prisma.message.create({ data: { role: "user", content: message, decisionId: decision.id } });

  const history: ChatMessage[] = decision.messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
  history.push({ role: "user", content: message });

  const aiResponse = await getAIResponse(history);

  const aiMsg = await prisma.message.create({
    data: { role: "assistant", content: aiResponse, decisionId: decision.id },
  });

  return NextResponse.json({
    userMessage: { role: "user", content: message },
    aiMessage: { role: "assistant", content: aiResponse, id: aiMsg.id },
  });
}
