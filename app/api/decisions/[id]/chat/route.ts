import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getReasoningResponse, type ChatMessage } from "@/lib/decision-engine";
import { getFounderContext } from "@/lib/api-helpers";

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

  const body = await req.json();
  const { message } = body;

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Load founder personality context
  const founderCtx = await getFounderContext(session.user.id);

  // Save user message
  await prisma.message.create({
    data: {
      role: "user",
      content: message,
      decisionId: decision.id,
    },
  });

  // Build conversation history
  const conversationHistory: ChatMessage[] = decision.messages.map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
  conversationHistory.push({ role: "user", content: message });

  // Get AI response via reasoning engine with personality
  const startMs = Date.now();
  const aiResponse = await getReasoningResponse(
    conversationHistory,
    decision.title,
    decision.category || "other",
    founderCtx
  );
  const latencyMs = Date.now() - startMs;

  // Save AI response with metadata
  const aiMessage = await prisma.message.create({
    data: {
      role: "assistant",
      content: aiResponse,
      metadata: JSON.stringify({ latencyMs }),
      decisionId: decision.id,
    },
  });

  return NextResponse.json({
    userMessage: { role: "user", content: message },
    aiMessage: { role: "assistant", content: aiResponse, id: aiMessage.id },
  });
}
