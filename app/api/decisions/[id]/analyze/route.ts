import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildReasoningContext,
  detectBiases,
  generateStructuredAnalysis,
  serializeAnalysis,
} from "@/lib/decision-engine";
import type { ChatMessage } from "@/lib/decision-engine";
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

  // Load founder context for personality-aware analysis
  const founderCtx = await getFounderContext(session.user.id);

  const conversationHistory: ChatMessage[] = decision.messages.map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  try {
    // Run context extraction and bias detection in parallel
    const [context, biases] = await Promise.all([
      buildReasoningContext(
        decision.title,
        decision.category || "other",
        conversationHistory
      ),
      detectBiases(conversationHistory),
    ]);

    // Generate structured analysis with full prompt stack
    const analysis = await generateStructuredAnalysis(
      decision.title,
      decision.category || "other",
      context,
      biases,
      conversationHistory,
      founderCtx
    );

    const serialized = serializeAnalysis(analysis);

    // Save analysis and update decision with all structured data
    await prisma.message.create({
      data: {
        role: "assistant",
        content: `__ANALYSIS__${serialized}`,
        decisionId: decision.id,
      },
    });

    const updated = await prisma.decision.update({
      where: { id: decision.id },
      data: {
        aiAnalysis: serialized,
        aiStructuredContext: JSON.stringify(context),
        personalitySnapshot: founderCtx.personality ?? null,
        status: "decided",
        decidedAt: new Date(),
      },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    return NextResponse.json({ ...updated, analysisData: analysis });
  } catch (error) {
    console.error("[POST /analyze]", error);
    return NextResponse.json({ error: "Analysis generation failed" }, { status: 500 });
  }
}
