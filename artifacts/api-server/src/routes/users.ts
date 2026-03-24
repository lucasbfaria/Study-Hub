import { Router, type IRouter } from "express";
import { db, usersTable, groupsTable, groupMembersTable } from "@workspace/db";
import { eq, sql, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/session";
import { GetUserProfileParams, GetUserProfileResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users/:userId/profile", requireAuth, async (req, res): Promise<void> => {
  const params = GetUserProfileParams.safeParse({ userId: Number(req.params.userId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.userId));
  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado" });
    return;
  }

  const memberships = await db
    .select({ groupId: groupMembersTable.groupId })
    .from(groupMembersTable)
    .where(eq(groupMembersTable.userId, params.data.userId));

  const groupIds = memberships.map((m) => m.groupId);

  let groups: any[] = [];
  if (groupIds.length > 0) {
    const rawGroups = await db
      .select({
        id: groupsTable.id,
        name: groupsTable.name,
        adminId: groupsTable.adminId,
        adminName: usersTable.name,
        createdAt: groupsTable.createdAt,
      })
      .from(groupsTable)
      .leftJoin(usersTable, eq(groupsTable.adminId, usersTable.id))
      .where(inArray(groupsTable.id, groupIds));

    const memberCounts = await db
      .select({
        groupId: groupMembersTable.groupId,
        count: sql<number>`count(*)`,
      })
      .from(groupMembersTable)
      .where(inArray(groupMembersTable.groupId, groupIds))
      .groupBy(groupMembersTable.groupId);

    const countMap = new Map(memberCounts.map((m) => [m.groupId, Number(m.count)]));

    groups = rawGroups.map((g) => ({
      id: g.id,
      name: g.name,
      adminId: g.adminId,
      adminName: g.adminName ?? "",
      memberCount: countMap.get(g.id) ?? 0,
      createdAt: g.createdAt,
    }));
  }

  res.json(
    GetUserProfileResponse.parse({
      id: user.id,
      name: user.name,
      email: user.email,
      streak: user.streak,
      totalHours: user.totalHours,
      groups,
      createdAt: user.createdAt,
    })
  );
});

export default router;
