import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const metrics = await prisma.metric.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  const grouped: Record<string, any[]> = {};
  metrics.forEach((m) => {
    if (!grouped[m.name]) grouped[m.name] = [];
    grouped[m.name].push(m);
  });

  return NextResponse.json({ metrics, grouped });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, value, unit, date } = await req.json();
  if (!name || value === undefined) {
    return NextResponse.json({ error: "Name and value required" }, { status: 400 });
  }

  const metric = await prisma.metric.create({
    data: { name, value: parseFloat(value), unit, date: date ? new Date(date) : new Date(), userId },
  });

  return NextResponse.json(metric, { status: 201 });
}
