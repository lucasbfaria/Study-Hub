import { Router, type IRouter } from "express";
import { db, invitesTable, groupsTable, groupMembersTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/session";
import {
  SendInviteParams,
  SendInviteBody,
  ListInvitesResponse,
  AcceptInviteParams,
  AcceptInviteResponse,
  RejectInviteParams,
  RejectInviteResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/groups/:groupId/invite", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as number;
  const params = SendInviteParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = SendInviteBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [group] = await db.select().from(groupsTable).where(eq(groupsTable.id, params.data.groupId));
  if (!group) {
    res.status(404).json({ error: "Grupo não encontrado" });
    return;
  }

  if (group.adminId !== userId) {
    res.status(403).json({ error: "Apenas o administrador pode convidar pessoas" });
    return;
  }

  const [targetUser] = await db.select().from(usersTable).where(eq(usersTable.email, body.data.email));
  if (!targetUser) {
    res.status(404).json({ error: "Usuário não encontrado" });
    return;
  }

  if (targetUser.id === userId) {
    res.status(400).json({ error: "Você não pode convidar a si mesmo" });
    return;
  }

  const [alreadyMember] = await db
    .select()
    .from(groupMembersTable)
    .where(and(eq(groupMembersTable.groupId, params.data.groupId), eq(groupMembersTable.userId, targetUser.id)));

  if (alreadyMember) {
    res.status(400).json({ error: "Usuário já é membro do grupo" });
    return;
  }

  const [existingInvite] = await db
    .select()
    .from(invitesTable)
    .where(
      and(
        eq(invitesTable.groupId, params.data.groupId),
        eq(invitesTable.invitedUserId, targetUser.id),
        eq(invitesTable.status, "pending")
      )
    );

  if (existingInvite) {
    res.status(400).json({ error: "Convite já enviado para este usuário" });
    return;
  }

  const [inviter] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  const [invite] = await db
    .insert(invitesTable)
    .values({
      groupId: params.data.groupId,
      invitedById: userId,
      invitedUserId: targetUser.id,
      status: "pending",
    })
    .returning();

  res.status(201).json({
    id: invite.id,
    groupId: invite.groupId,
    groupName: group.name,
    invitedById: invite.invitedById,
    invitedByName: inviter.name,
    invitedUserId: invite.invitedUserId,
    status: invite.status,
    createdAt: invite.createdAt,
  });
});

router.get("/invites", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as number;

  const invites = await db
    .select({
      id: invitesTable.id,
      groupId: invitesTable.groupId,
      groupName: groupsTable.name,
      invitedById: invitesTable.invitedById,
      invitedByName: usersTable.name,
      invitedUserId: invitesTable.invitedUserId,
      status: invitesTable.status,
      createdAt: invitesTable.createdAt,
    })
    .from(invitesTable)
    .leftJoin(groupsTable, eq(invitesTable.groupId, groupsTable.id))
    .leftJoin(usersTable, eq(invitesTable.invitedById, usersTable.id))
    .where(and(eq(invitesTable.invitedUserId, userId), eq(invitesTable.status, "pending")));

  const result = invites.map((i) => ({
    id: i.id,
    groupId: i.groupId,
    groupName: i.groupName ?? "",
    invitedById: i.invitedById,
    invitedByName: i.invitedByName ?? "",
    invitedUserId: i.invitedUserId,
    status: i.status,
    createdAt: i.createdAt,
  }));

  res.json(ListInvitesResponse.parse(result));
});

router.post("/invites/:inviteId/accept", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as number;
  const params = AcceptInviteParams.safeParse({ inviteId: Number(req.params.inviteId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [invite] = await db
    .select()
    .from(invitesTable)
    .where(and(eq(invitesTable.id, params.data.inviteId), eq(invitesTable.invitedUserId, userId)));

  if (!invite) {
    res.status(404).json({ error: "Convite não encontrado" });
    return;
  }

  if (invite.status !== "pending") {
    res.status(400).json({ error: "Convite já processado" });
    return;
  }

  await db.update(invitesTable).set({ status: "accepted" }).where(eq(invitesTable.id, invite.id));

  const [alreadyMember] = await db
    .select()
    .from(groupMembersTable)
    .where(and(eq(groupMembersTable.groupId, invite.groupId), eq(groupMembersTable.userId, userId)));

  if (!alreadyMember) {
    await db.insert(groupMembersTable).values({ groupId: invite.groupId, userId });
  }

  res.json(AcceptInviteResponse.parse({ message: "Convite aceito! Bem-vindo ao grupo!" }));
});

router.post("/invites/:inviteId/reject", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as number;
  const params = RejectInviteParams.safeParse({ inviteId: Number(req.params.inviteId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [invite] = await db
    .select()
    .from(invitesTable)
    .where(and(eq(invitesTable.id, params.data.inviteId), eq(invitesTable.invitedUserId, userId)));

  if (!invite) {
    res.status(404).json({ error: "Convite não encontrado" });
    return;
  }

  await db.update(invitesTable).set({ status: "rejected" }).where(eq(invitesTable.id, invite.id));

  res.json(RejectInviteResponse.parse({ message: "Convite recusado" }));
});

export default router;
