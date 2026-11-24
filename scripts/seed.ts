import { eq, sql } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { hashPassword } from "../lib/auth/password";
import { closeDb, getDb } from "../lib/db";
import * as s from "../lib/db/schema";
import { newId } from "../lib/ids";
import { runMigrations } from "./migrate";
import { CIRCLES, GATHERINGS, MEMBERS, POSTS, PROJECTS } from "./seed-data/community";
import { COURSES } from "./seed-data/courses";
import { RETREATS } from "./seed-data/retreats";

const HOUR = 60 * 60 * 1000;

async function upsertUser(email: string, name: string, password: string, role: "member" | "admin", extra: Partial<s.User> = {}) {
  const db = getDb();
  const existing = db.select().from(s.users).where(eq(s.users.email, email)).get();
  const passwordHash = await hashPassword(password);
  if (existing) {
    db.update(s.users).set({ name, role, passwordHash, ...extra }).where(eq(s.users.id, existing.id)).run();
    return existing.id;
  }
  const id = newId("usr");
  db.insert(s.users).values({ id, email, name, role, passwordHash, ...extra }).run();
  db.insert(s.journeys).values({ userId: id }).onConflictDoNothing().run();
  return id;
}

async function main() {
  runMigrations();
  const db = getDb();

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@mystical-school.test";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const memberEmail = process.env.SEED_MEMBER_EMAIL ?? "seeker@mystical-school.test";
  const memberPassword = process.env.SEED_MEMBER_PASSWORD;
  if (!adminPassword || !memberPassword) {
    throw new Error("Set SEED_ADMIN_PASSWORD and SEED_MEMBER_PASSWORD in .env before seeding (see .env.example).");
  }

  const adminId = await upsertUser(adminEmail, "School Admin", adminPassword, "admin");
  const testerId = await upsertUser(memberEmail, "Sam Seeker", memberPassword, "member");
  db.update(s.journeys)
    .set({
      intention: "I want to feel calmer and understand why I react the way I do with my family.",
      focusAreas: ["self-knowledge", "meditation"],
      experience: "some",
      onboardedAt: new Date(),
    })
    .where(eq(s.journeys.userId, testerId))
    .run();
  db.update(s.journeys).set({ onboardedAt: new Date(), focusAreas: ["wisdom-in-action"], experience: "teaching", intention: "Look after the school." }).where(eq(s.journeys.userId, adminId)).run();

  const courseCount = db.select({ n: sql<number>`count(*)` }).from(s.courses).get()?.n ?? 0;
  if (courseCount > 0) {
    console.log("Content already seeded; accounts refreshed.");
    return;
  }

  // Courses
  COURSES.forEach((c, ci) => {
    const courseId = newId("crs");
    db.insert(s.courses)
      .values({
        id: courseId,
        slug: c.slug,
        title: c.title,
        subtitle: c.subtitle,
        description: c.description,
        studyArea: c.studyArea,
        level: c.level,
        priceCents: c.priceCents,
        teacherName: c.teacherName,
        teacherBio: c.teacherBio,
        durationLabel: c.durationLabel,
        outcomes: c.outcomes,
        position: ci,
      })
      .run();
    c.modules.forEach((m, mi) => {
      const moduleId = newId("mod");
      db.insert(s.courseModules).values({ id: moduleId, courseId, position: mi, title: m.title }).run();
      m.lessons.forEach((l, li) => {
        db.insert(s.lessons)
          .values({
            id: newId("lsn"),
            moduleId,
            courseId,
            position: li,
            title: l.title,
            durationMin: l.durationMin,
            body: l.body,
            practice: l.practice,
            actionPrompt: l.action,
            isPreview: Boolean(l.preview),
          })
          .run();
      });
    });
  });

  // Retreats
  for (const r of RETREATS) {
    const retreatId = newId("rtr");
    const { rooms, ...rest } = r;
    db.insert(s.retreats).values({ id: retreatId, ...rest }).run();
    rooms.forEach((room, i) => db.insert(s.retreatRooms).values({ id: newId("rom"), retreatId, position: i, ...room }).run());
  }

  // Community
  const circleIds: Record<string, string> = {};
  CIRCLES.forEach((c, i) => {
    const id = newId("cir");
    circleIds[c.slug] = id;
    db.insert(s.circles).values({ id, position: i, ...c }).run();
  });

  const memberIds: Record<string, string> = {};
  for (const m of MEMBERS) {
    // Sample members get a random password nobody knows: they exist to make the community feel real.
    memberIds[m.key] = await upsertUser(`${m.key}@members.mystical-school.test`, m.name, randomBytes(24).toString("base64url"), "member", {
      bio: m.bio,
      location: m.location,
    });
    db.update(s.journeys).set({ onboardedAt: new Date() }).where(eq(s.journeys.userId, memberIds[m.key]!)).run();
  }

  const join = (circleSlug: string, userId: string) =>
    db.insert(s.circleMembers).values({ circleId: circleIds[circleSlug]!, userId }).onConflictDoNothing().run();

  for (const p of POSTS) {
    const postId = newId("pst");
    const at = new Date(Date.now() - p.hoursAgo * HOUR);
    join(p.circle, memberIds[p.author]!);
    db.insert(s.posts).values({ id: postId, circleId: circleIds[p.circle]!, authorId: memberIds[p.author]!, body: p.body, createdAt: at }).run();
    p.comments.forEach((c, i) => {
      join(p.circle, memberIds[c.author]!);
      db.insert(s.comments)
        .values({ id: newId("cmt"), postId, authorId: memberIds[c.author]!, body: c.body, createdAt: new Date(at.getTime() + (i + 1) * HOUR) })
        .run();
    });
    p.resonates.forEach((r) => db.insert(s.reactions).values({ postId, userId: memberIds[r]! }).onConflictDoNothing().run());
  }
  join("introductions", testerId);
  join("meditation", testerId);
  join("self-knowledge", testerId);

  const projectIds: Record<string, string> = {};
  for (const p of PROJECTS) {
    const id = newId("prj");
    projectIds[p.slug] = id;
    db.insert(s.projects)
      .values({
        id,
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        description: p.description,
        studyArea: p.studyArea,
        helpWanted: p.helpWanted,
        status: p.status,
        ownerId: memberIds[p.owner]!,
      })
      .run();
    db.insert(s.projectMembers).values({ projectId: id, userId: memberIds[p.owner]!, role: "lead" }).run();
    p.members.forEach((m) => db.insert(s.projectMembers).values({ projectId: id, userId: memberIds[m]! }).run());
    p.updates.forEach((u) =>
      db.insert(s.projectUpdates)
        .values({ id: newId("pup"), projectId: id, authorId: memberIds[u.author]!, body: u.body, createdAt: new Date(Date.now() - u.hoursAgo * HOUR) })
        .run(),
    );
  }

  for (const g of GATHERINGS) {
    const start = new Date();
    start.setDate(start.getDate() + g.daysFromNow);
    start.setHours(g.hour, 0, 0, 0);
    db.insert(s.gatherings)
      .values({
        id: newId("gth"),
        title: g.title,
        description: g.description,
        hostId: memberIds[g.host]!,
        circleId: g.circle ? circleIds[g.circle]! : null,
        projectId: g.project ? projectIds[g.project]! : null,
        startsAt: start,
        durationMin: g.durationMin,
        provider: "none",
      })
      .run();
  }

  console.log(`Seeded ${COURSES.length} courses, ${RETREATS.length} retreats, ${CIRCLES.length} circles, ${PROJECTS.length} projects.`);
  console.log(`Admin: ${adminEmail} · Test member: ${memberEmail} (passwords are in .env)`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
