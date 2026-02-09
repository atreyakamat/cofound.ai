import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const metrics = await prisma.metric.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  // Group by name and get latest
  const grouped: Record<string, any[]> = {};
  metrics.forEach((m) => {
    if (!grouped[m.name]) grouped[m.name] = [];
    grouped[m.name].push(m);
  });

  return NextResponse.json({ metrics, grouped });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, value, unit, date } = body;

  if (!name || value === undefined) {
    return NextResponse.json(
      { error: "Name and value are required" },
      { status: 400 }
    );
  }

  const metric = await prisma.metric.create({
    data: {
      name,
      value: parseFloat(value),
      unit,
      date: date ? new Date(date) : new Date(),
      userId: session.user.id,
    },
  });

  return NextResponse.json(metric, { status: 201 });
}
