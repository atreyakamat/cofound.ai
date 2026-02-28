import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/decisions/[id]/tags
 * Add tags to a decision.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const decision = await prisma.decision.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true },
  });
  if (!decision)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { tags } = body as { tags: string[] };

  if (!tags || !Array.isArray(tags))
    return NextResponse.json({ error: "tags[] is required" }, { status: 400 });

  // Upsert tags (ignore duplicates)
  const created = await Promise.all(
    tags.map((name) =>
      prisma.decisionTag.upsert({
        where: { decisionId_name: { decisionId: decision.id, name } },
        create: { name, decisionId: decision.id },
        update: {},
      })
    )
  );

  return NextResponse.json(created, { status: 201 });
}

/**
 * DELETE /api/decisions/[id]/tags
 * Remove a tag by name.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name } = body;

  if (!name)
    return NextResponse.json({ error: "Tag name is required" }, { status: 400 });

  await prisma.decisionTag.deleteMany({
    where: { decisionId: params.id, name },
  });

  return NextResponse.json({ ok: true });
}
