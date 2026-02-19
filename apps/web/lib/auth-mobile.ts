import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "./auth";

export async function getUserId(req: NextRequest): Promise<string | null> {
  // Try NextAuth session first (web browsers)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return session.user.id;

  // Try Bearer token (mobile JWT)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET!
      ) as { id: string };
      return decoded.id;
    } catch {
      return null;
    }
  }

  return null;
}
