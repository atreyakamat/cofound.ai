import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getUserId(req: Request): Promise<string | null> {
  // Try NextAuth session first (web)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return session.user.id;

  // Try Bearer token (mobile)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
      return decoded.id;
    } catch {
      return null;
    }
  }

  return null;
}
