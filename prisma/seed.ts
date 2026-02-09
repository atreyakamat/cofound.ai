import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@cofound.ai" },
    update: {},
    create: {
      name: "Demo Founder",
      email: "demo@cofound.ai",
      hashedPassword,
      companyName: "Demo Startup",
      industry: "SaaS",
      stage: "seed",
    },
  });

  console.log("Seeded user:", user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
