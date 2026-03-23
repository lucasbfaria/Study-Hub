import { Router, type IRouter } from "express";
import { db, groupsTable, groupMembersTable, usersTable, postsTable } from "@workspace/db";
import { eq, and, sql, gte } from "drizzle-orm";
import { requireAuth } from "../middlewares/session";
import {
  CreateGroupBody,
  GetGroupParams,
  GetGroupResponse,
  ListGroupsResponse,
  ListGroupMembersParams,
  ListGroupMembersResponse,
  ListGroupPostsParams,
  ListGroupPostsResponse,
  CreatePostParams,
  CreatePostBody,
  GetGroupRankingParams,
  GetGroupRankingResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/groups", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as number;

  const memberships = await db
    .select({ groupId: groupMembersTable.groupId })
    .from(groupMembersTable)
    .where(eq(groupMembersTable.userId, userId));

  const groupIds = memberships.map((m) => m.groupId);

  if (groupIds.length === 0) {
    res.json(ListGroupsResponse.parse([]));
    return;
  }

  const groups = await db
    .select({
      id: groupsTable.id,
      name: groupsTable.name,
      adminId: groupsTable.adminId,
      adminName: usersTable.name,
      createdAt: groupsTable.createdAt,
    })
    .from(groupsTable)
    .leftJoin(usersTable, eq(groupsTable.adminId, usersTable.id))
    .where(sql`${groupsTable.id} = ANY(${groupIds})`);

  const memberCounts = await db
    .select({
      groupId: groupMembersTable.groupId,
      count: sql<number>`count(*)`,
    })
    .from(groupMembersTable)
    .where(sql`${groupMembersTable.groupId} = ANY(${groupIds})`)
    .groupBy(groupMembersTable.groupId);

  const countMap = new Map(memberCounts.map((m) => [m.groupId, Number(m.count)]));

  const result = groups.map((g) => ({
    id: g.id,
    name: g.name,
    adminId: g.adminId,
    adminName: g.adminName ?? "",
    memberCount: countMap.get(g.id) ?? 0,
    createdAt: g.createdAt,
  }));

  res.json(ListGroupsResponse.parse(result));
});

router.post("/groups", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as number;
  const parsed = CreateGroupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [group] = await db
    .insert(groupsTable)
    .values({ name: parsed.data.name, adminId: userId })
    .returning();

  await db.insert(groupMembersTable).values({ groupId: group.id, userId });

  const [admin] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  res.status(201).json(
    GetGroupResponse.parse({
      id: group.id,
      name: group.name,
      adminId: group.adminId,
      adminName: admin.name,
      memberCount: 1,
      createdAt: group.createdAt,
    })
  );
});

router.get("/groups/:groupId", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as number;
  const params = GetGroupParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [group] = await db
    .select({
      id: groupsTable.id,
      name: groupsTable.name,
      adminId: groupsTable.adminId,
      adminName: usersTable.name,
      createdAt: groupsTable.createdAt,
    })
    .from(groupsTable)
    .leftJoin(usersTable, eq(groupsTable.adminId, usersTable.id))
    .where(eq(groupsTable.id, params.data.groupId));

  if (!group) {
    res.status(404).json({ error: "Grupo não encontrado" });
    return;
  }

  const [membership] = await db
    .select()
    .from(groupMembersTable)
    .where(and(eq(groupMembersTable.groupId, params.data.groupId), eq(groupMembersTable.userId, userId)));

  if (!membership) {
    res.status(403).json({ error: "Acesso negado" });
    return;
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(groupMembersTable)
    .where(eq(groupMembersTable.groupId, params.data.groupId));

  res.json(
    GetGroupResponse.parse({
      id: group.id,
      name: group.name,
      adminId: group.adminId,
      adminName: group.adminName ?? "",
      memberCount: Number(count),
      createdAt: group.createdAt,
    })
  );
});

router.get("/groups/:groupId/members", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as number;
  const params = ListGroupMembersParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [membership] = await db
    .select()
    .from(groupMembersTable)
    .where(and(eq(groupMembersTable.groupId, params.data.groupId), eq(groupMembersTable.userId, userId)));

  if (!membership) {
    res.status(403).json({ error: "Acesso negado" });
    return;
  }

  const [group] = await db.select().from(groupsTable).where(eq(groupsTable.id, params.data.groupId));

  const members = await db
    .select({
      userId: usersTable.id,
      name: usersTable.name,
      streak: usersTable.streak,
      totalHours: usersTable.totalHours,
    })
    .from(groupMembersTable)
    .leftJoin(usersTable, eq(groupMembersTable.userId, usersTable.id))
    .where(eq(groupMembersTable.groupId, params.data.groupId));

  const result = members.map((m) => ({
    userId: m.userId!,
    name: m.name ?? "",
    streak: m.streak ?? 0,
    totalHours: m.totalHours ?? 0,
    isAdmin: m.userId === group.adminId,
  }));

  res.json(ListGroupMembersResponse.parse(result));
});

router.get("/groups/:groupId/posts", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as number;
  const params = ListGroupPostsParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [membership] = await db
    .select()
    .from(groupMembersTable)
    .where(and(eq(groupMembersTable.groupId, params.data.groupId), eq(groupMembersTable.userId, userId)));

  if (!membership) {
    res.status(403).json({ error: "Acesso negado" });
    return;
  }

  const posts = await db
    .select({
      id: postsTable.id,
      groupId: postsTable.groupId,
      userId: postsTable.userId,
      userName: usersTable.name,
      subject: postsTable.subject,
      hours: postsTable.hours,
      description: postsTable.description,
      createdAt: postsTable.createdAt,
    })
    .from(postsTable)
    .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
    .where(eq(postsTable.groupId, params.data.groupId))
    .orderBy(sql`${postsTable.createdAt} DESC`);

  const result = posts.map((p) => ({
    id: p.id,
    groupId: p.groupId,
    userId: p.userId,
    userName: p.userName ?? "",
    subject: p.subject,
    hours: p.hours,
    description: p.description ?? null,
    createdAt: p.createdAt,
  }));

  res.json(ListGroupPostsResponse.parse(result));
});

router.post("/groups/:groupId/posts", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as number;
  const params = CreatePostParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [membership] = await db
    .select()
    .from(groupMembersTable)
    .where(and(eq(groupMembersTable.groupId, params.data.groupId), eq(groupMembersTable.userId, userId)));

  if (!membership) {
    res.status(403).json({ error: "Você não é membro deste grupo" });
    return;
  }

  const body = CreatePostBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [post] = await db
    .insert(postsTable)
    .values({
      groupId: params.data.groupId,
      userId,
      subject: body.data.subject,
      hours: body.data.hours,
      description: body.data.description ?? null,
    })
    .returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  const today = new Date().toISOString().split("T")[0];
  const newTotalHours = user.totalHours + body.data.hours;

  let newStreak = user.streak;
  if (user.lastStudyDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (user.lastStudyDate === yesterday) {
      newStreak = user.streak + 1;
    } else if (!user.lastStudyDate) {
      newStreak = 1;
    } else {
      newStreak = 1;
    }
  }

  await db
    .update(usersTable)
    .set({ totalHours: newTotalHours, streak: newStreak, lastStudyDate: today })
    .where(eq(usersTable.id, userId));

  res.status(201).json({
    id: post.id,
    groupId: post.groupId,
    userId: post.userId,
    userName: user.name,
    subject: post.subject,
    hours: post.hours,
    description: post.description ?? null,
    createdAt: post.createdAt,
  });
});

router.get("/groups/:groupId/ranking", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as number;
  const params = GetGroupRankingParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [membership] = await db
    .select()
    .from(groupMembersTable)
    .where(and(eq(groupMembersTable.groupId, params.data.groupId), eq(groupMembersTable.userId, userId)));

  if (!membership) {
    res.status(403).json({ error: "Acesso negado" });
    return;
  }

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const members = await db
    .select({
      userId: usersTable.id,
      name: usersTable.name,
      streak: usersTable.streak,
    })
    .from(groupMembersTable)
    .leftJoin(usersTable, eq(groupMembersTable.userId, usersTable.id))
    .where(eq(groupMembersTable.groupId, params.data.groupId));

  const weeklyHoursResult = await db
    .select({
      userId: postsTable.userId,
      weeklyHours: sql<number>`coalesce(sum(${postsTable.hours}), 0)`,
    })
    .from(postsTable)
    .where(and(eq(postsTable.groupId, params.data.groupId), gte(postsTable.createdAt, weekStart)))
    .groupBy(postsTable.userId);

  const hoursMap = new Map(weeklyHoursResult.map((r) => [r.userId, Number(r.weeklyHours)]));

  const ranking = members
    .map((m) => ({
      userId: m.userId!,
      name: m.name ?? "",
      weeklyHours: hoursMap.get(m.userId!) ?? 0,
      streak: m.streak ?? 0,
    }))
    .sort((a, b) => b.weeklyHours - a.weeklyHours)
    .map((m, i) => ({ ...m, rank: i + 1 }));

  res.json(GetGroupRankingResponse.parse(ranking));
});

export default router;
