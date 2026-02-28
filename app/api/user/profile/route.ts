import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inferPersonality } from "@/lib/prompts/personality";

/**
 * GET /api/user/profile
 * Returns current user profile + personality data.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      companyName: true,
      industry: true,
      stage: true,
      teamSize: true,
      monthlyBurn: true,
      runway: true,
      personalityType: true,
      riskTolerance: true,
      decisionSpeed: true,
      onboardingCompleted: true,
      createdAt: true,
    },
  });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(user);
}

/**
 * PATCH /api/user/profile
 * Update user profile fields. Also triggers personality re-inference
 * if personalityType is not explicitly set.
 */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const allowed = [
    "name", "companyName", "industry", "stage",
    "teamSize", "monthlyBurn", "runway", "website",
    "personalityType", "riskTolerance", "decisionSpeed",
    "onboardingCompleted",
  ];

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  // If they set personalityType explicitly, derive other fields
  if (data.personalityType) {
    const profile = inferPersonality({ selfDeclaredStyle: data.personalityType as string });
    data.riskTolerance = profile.riskTolerance;
    data.decisionSpeed = profile.decisionSpeed;
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true,
      name: true,
      companyName: true,
      industry: true,
      stage: true,
      personalityType: true,
      riskTolerance: true,
      decisionSpeed: true,
      onboardingCompleted: true,
    },
  });

  return NextResponse.json(updated);
}
