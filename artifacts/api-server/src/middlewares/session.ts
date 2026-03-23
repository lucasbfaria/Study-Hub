import { Request, Response, NextFunction } from "express";
import { db, sessionsTable, usersTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";

export async function sessionMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessionId = req.cookies?.sessionId;

  if (!sessionId) {
    next();
    return;
  }

  const now = new Date();
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(and(eq(sessionsTable.sessionId, sessionId), gt(sessionsTable.expiresAt, now)));

  if (!session) {
    next();
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId));

  if (user) {
    (req as any).userId = user.id;
    (req as any).user = user;
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!(req as any).userId) {
    res.status(401).json({ error: "Não autorizado" });
    return;
  }
  next();
}
