import { db, usersTable, groupsTable, groupMembersTable, postsTable } from "@workspace/db";
import crypto from "crypto";

function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

async function seed() {
  console.log("Seeding database...");

  const [ana] = await db.insert(usersTable).values({
    name: "Ana Silva",
    email: "ana@exemplo.com",
    passwordHash: await hashPassword("senha123"),
    streak: 7,
    totalHours: 42.5,
    lastStudyDate: new Date().toISOString().split("T")[0],
  }).returning().onConflictDoNothing();

  const [carlos] = await db.insert(usersTable).values({
    name: "Carlos Mendes",
    email: "carlos@exemplo.com",
    passwordHash: await hashPassword("senha123"),
    streak: 3,
    totalHours: 28,
    lastStudyDate: new Date().toISOString().split("T")[0],
  }).returning().onConflictDoNothing();

  const [julia] = await db.insert(usersTable).values({
    name: "Júlia Ferreira",
    email: "julia@exemplo.com",
    passwordHash: await hashPassword("senha123"),
    streak: 5,
    totalHours: 35,
    lastStudyDate: new Date().toISOString().split("T")[0],
  }).returning().onConflictDoNothing();

  if (!ana || !carlos || !julia) {
    console.log("Users already seeded, skipping...");
    return;
  }

  const [group] = await db.insert(groupsTable).values({
    name: "Maratona de Programação",
    adminId: ana.id,
  }).returning();

  await db.insert(groupMembersTable).values([
    { groupId: group.id, userId: ana.id },
    { groupId: group.id, userId: carlos.id },
    { groupId: group.id, userId: julia.id },
  ]);

  const [group2] = await db.insert(groupsTable).values({
    name: "Concursos Públicos",
    adminId: carlos.id,
  }).returning();

  await db.insert(groupMembersTable).values([
    { groupId: group2.id, userId: carlos.id },
    { groupId: group2.id, userId: julia.id },
  ]);

  const today = new Date();
  const yesterday = new Date(today.getTime() - 86400000);
  const twoDaysAgo = new Date(today.getTime() - 2 * 86400000);

  await db.insert(postsTable).values([
    {
      groupId: group.id,
      userId: ana.id,
      subject: "Algoritmos e Estruturas de Dados",
      hours: 3.5,
      description: "Estudei árvores binárias e grafos. Muito produtivo!",
      createdAt: today,
    },
    {
      groupId: group.id,
      userId: carlos.id,
      subject: "Banco de Dados",
      hours: 2,
      description: "Revisão de SQL e joins complexos.",
      createdAt: yesterday,
    },
    {
      groupId: group.id,
      userId: julia.id,
      subject: "React e TypeScript",
      hours: 4,
      description: "Implementei hooks customizados e context API.",
      createdAt: yesterday,
    },
    {
      groupId: group.id,
      userId: ana.id,
      subject: "Sistemas Operacionais",
      hours: 1.5,
      description: null,
      createdAt: twoDaysAgo,
    },
    {
      groupId: group2.id,
      userId: carlos.id,
      subject: "Direito Constitucional",
      hours: 3,
      description: "Capítulo sobre direitos fundamentais.",
      createdAt: today,
    },
    {
      groupId: group2.id,
      userId: julia.id,
      subject: "Português",
      hours: 2.5,
      description: "Exercícios de interpretação de texto.",
      createdAt: today,
    },
  ]);

  console.log("Seed complete!");
  console.log("Users created:");
  console.log("  ana@exemplo.com / senha123");
  console.log("  carlos@exemplo.com / senha123");
  console.log("  julia@exemplo.com / senha123");
}

seed().catch(console.error).finally(() => process.exit(0));
