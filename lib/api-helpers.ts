/**
 * Shared API helpers — auth checks, founder context extraction, error formatting.
 */

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { FounderContext } from "@/lib/prompts";
import type { FounderPersonality } from "@/lib/prompts/personality";

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFound(entity = "Resource") {
  return NextResponse.json({ error: `${entity} not found` }, { status: 404 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Load FounderContext from User record for prompt injection.
 */
export async function getFounderContext(userId: string): Promise<FounderContext> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      companyName: true,
      stage: true,
      industry: true,
      personalityType: true,
    },
  });

  if (!user) return {};

  return {
    name: user.name ?? undefined,
    companyName: user.companyName ?? undefined,
    stage: user.stage ?? undefined,
    industry: user.industry ?? undefined,
    personality: (user.personalityType as FounderPersonality) ?? undefined,
  };
}
