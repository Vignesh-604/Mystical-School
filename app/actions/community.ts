"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/auth/rate-limit";
import { requireUser } from "@/lib/auth/session";
import { isCircleMember } from "@/lib/community";
import { getDb } from "@/lib/db";
import {
  circleMembers,
  circles,
  comments,
  gatheringRsvps,
  gatherings,
  posts,
  projectMembers,
  projects,
  projectUpdates,
  reactions,
  reports,
  users,
} from "@/lib/db/schema";
import { env } from "@/lib/env";
import { newId, slugify } from "@/lib/ids";
import { createSmartMeetMeeting } from "@/lib/smartmeet";
import { STUDY_AREA_BY_KEY } from "@/lib/study-areas";

export type FormState = { error?: string; ok?: boolean } | undefined;

function limited(userId: string, kind: string, max: number, minutes: number) {
  return !rateLimit(`${kind}:${userId}`, max, minutes * 60_000).ok;
}

// ─── Circles ───────────────────────────────────────────────────────────────

export async function toggleCircleAction(form: FormData) {
  const user = await requireUser("/community");
  const circleId = String(form.get("circleId") ?? "");
  const circle = getDb().select().from(circles).where(eq(circles.id, circleId)).get();
  if (!circle) return;
  if (isCircleMember(circleId, user.id)) {
    getDb().delete(circleMembers).where(and(eq(circleMembers.circleId, circleId), eq(circleMembers.userId, user.id))).run();
  } else {
    getDb().insert(circleMembers).values({ circleId, userId: user.id }).onConflictDoNothing().run();
  }
  revalidatePath("/community", "layout");
}

const postSchema = z.object({
  circleId: z.string().min(1).max(64),
  body: z.string().trim().min(2, "Write a little more.").max(5000, "Posts can be up to 5,000 characters."),
});

export async function createPostAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("/community");
  const parsed = postSchema.safeParse({ circleId: form.get("circleId"), body: form.get("body") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  if (limited(user.id, "post", 8, 10)) return { error: "You're posting quickly. Please wait a few minutes." };
  const db = getDb();
  const circle = db.select().from(circles).where(eq(circles.id, parsed.data.circleId)).get();
  if (!circle) return { error: "Circle not found." };
  // Posting in a circle joins it.
  db.insert(circleMembers).values({ circleId: circle.id, userId: user.id }).onConflictDoNothing().run();
  db.insert(posts).values({ id: newId("pst"), circleId: circle.id, authorId: user.id, body: parsed.data.body }).run();
  revalidatePath(`/community/circles/${circle.slug}`);
  revalidatePath("/community");
  return { ok: true };
}

const commentSchema = z.object({
  postId: z.string().min(1).max(64),
  body: z.string().trim().min(1, "Write a reply first.").max(2000),
});

export async function addCommentAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("/community");
  const parsed = commentSchema.safeParse({ postId: form.get("postId"), body: form.get("body") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  if (limited(user.id, "comment", 20, 10)) return { error: "You're replying quickly. Please wait a few minutes." };
  const db = getDb();
  const post = db.select({ id: posts.id, circleId: posts.circleId, hidden: posts.hidden }).from(posts).where(eq(posts.id, parsed.data.postId)).get();
  if (!post || post.hidden) return { error: "That post is no longer available." };
  db.insert(comments).values({ id: newId("cmt"), postId: post.id, authorId: user.id, body: parsed.data.body }).run();
  const circle = db.select({ slug: circles.slug }).from(circles).where(eq(circles.id, post.circleId)).get();
  revalidatePath(`/community/circles/${circle?.slug}`);
  revalidatePath("/community");
  return { ok: true };
}

export async function toggleResonateAction(form: FormData) {
  const user = await requireUser("/community");
  const postId = String(form.get("postId") ?? "");
  const db = getDb();
  const existing = db.select().from(reactions).where(and(eq(reactions.postId, postId), eq(reactions.userId, user.id))).get();
  if (existing) db.delete(reactions).where(and(eq(reactions.postId, postId), eq(reactions.userId, user.id))).run();
  else if (db.select({ id: posts.id }).from(posts).where(eq(posts.id, postId)).get()) {
    db.insert(reactions).values({ postId, userId: user.id }).run();
  }
  revalidatePath("/community", "layout");
}

export async function deleteOwnPostAction(form: FormData) {
  const user = await requireUser("/community");
  const postId = String(form.get("postId") ?? "");
  getDb().delete(posts).where(and(eq(posts.id, postId), eq(posts.authorId, user.id))).run();
  revalidatePath("/community", "layout");
}

export async function deleteOwnCommentAction(form: FormData) {
  const user = await requireUser("/community");
  const commentId = String(form.get("commentId") ?? "");
  getDb().delete(comments).where(and(eq(comments.id, commentId), eq(comments.authorId, user.id))).run();
  revalidatePath("/community", "layout");
}

const reportSchema = z.object({
  targetType: z.enum(["post", "comment", "project_update"]),
  targetId: z.string().min(1).max(64),
  reason: z.string().trim().min(3, "Tell us briefly what's wrong.").max(500),
});

export async function reportAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("/community");
  const parsed = reportSchema.safeParse({ targetType: form.get("targetType"), targetId: form.get("targetId"), reason: form.get("reason") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  if (limited(user.id, "report", 10, 60)) return { error: "Thank you. We've received several reports from you; we'll review them." };
  getDb().insert(reports).values({ id: newId("rpt"), reporterId: user.id, ...parsed.data }).run();
  audit(user.id, "report.created", parsed.data.targetId, { targetType: parsed.data.targetType });
  return { ok: true };
}

// ─── Projects ──────────────────────────────────────────────────────────────

const projectSchema = z.object({
  title: z.string().trim().min(4, "Give your project a clear title.").max(90),
  summary: z.string().trim().min(10, "Add a one-line summary.").max(200),
  description: z.string().trim().min(30, "Describe the project in a few sentences.").max(4000),
  studyArea: z.string().refine((k) => k in STUDY_AREA_BY_KEY, "Choose a subject."),
  helpWanted: z.string().trim().max(400).optional(),
});

export async function createProjectAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("/community/projects/new");
  const parsed = projectSchema.safeParse({
    title: form.get("title"),
    summary: form.get("summary"),
    description: form.get("description"),
    studyArea: form.get("studyArea"),
    helpWanted: form.get("helpWanted") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  if (limited(user.id, "project", 3, 60)) return { error: "You've started several projects recently. Please try again later." };
  const db = getDb();
  let slug = slugify(parsed.data.title) || "project";
  if (db.select({ id: projects.id }).from(projects).where(eq(projects.slug, slug)).get()) slug = `${slug}-${newId("x").slice(-5).toLowerCase()}`;
  const id = newId("prj");
  db.transaction((tx) => {
    tx.insert(projects).values({ id, slug, ownerId: user.id, ...parsed.data, helpWanted: parsed.data.helpWanted ?? null }).run();
    tx.insert(projectMembers).values({ projectId: id, userId: user.id, role: "lead" }).run();
  });
  revalidatePath("/community/projects");
  redirect(`/community/projects/${slug}`);
}

export async function toggleProjectMembershipAction(form: FormData) {
  const user = await requireUser("/community/projects");
  const projectId = String(form.get("projectId") ?? "");
  const db = getDb();
  const project = db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project) return;
  const existing = db.select().from(projectMembers).where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, user.id))).get();
  if (existing) {
    if (existing.role !== "lead") db.delete(projectMembers).where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, user.id))).run();
  } else {
    db.insert(projectMembers).values({ projectId, userId: user.id }).run();
  }
  revalidatePath(`/community/projects/${project.slug}`);
}

export async function postProjectUpdateAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("/community/projects");
  const projectId = String(form.get("projectId") ?? "");
  const body = String(form.get("body") ?? "").trim();
  if (body.length < 2 || body.length > 3000) return { error: "Updates can be 2 to 3,000 characters." };
  const db = getDb();
  const project = db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project) return { error: "Project not found." };
  const member = db.select().from(projectMembers).where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, user.id))).get();
  if (!member) return { error: "Join the project to post updates." };
  db.insert(projectUpdates).values({ id: newId("pup"), projectId, authorId: user.id, body }).run();
  revalidatePath(`/community/projects/${project.slug}`);
  return { ok: true };
}

export async function setProjectStatusAction(form: FormData) {
  const user = await requireUser("/community/projects");
  const projectId = String(form.get("projectId") ?? "");
  const status = z.enum(["forming", "active", "completed"]).safeParse(form.get("status"));
  const db = getDb();
  const project = db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project || project.ownerId !== user.id || !status.success) return;
  db.update(projects).set({ status: status.data }).where(eq(projects.id, projectId)).run();
  revalidatePath(`/community/projects/${project.slug}`);
}

// ─── Gatherings ────────────────────────────────────────────────────────────

const gatheringSchema = z.object({
  title: z.string().trim().min(4, "Give the gathering a title.").max(100),
  description: z.string().trim().min(10, "Add a short description.").max(1500),
  startsLocal: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Choose a date and time."),
  tzOffset: z.coerce.number().int().min(-840).max(840),
  durationMin: z.coerce.number().int().min(10).max(240),
  where: z.string().max(80).optional(),
  link: z.union([z.literal(""), z.url("Enter a full link starting with https://").startsWith("https://", "Links must start with https://")]).optional(),
});

export async function createGatheringAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("/community/gatherings/new");
  const parsed = gatheringSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  if (limited(user.id, "gathering", 5, 60)) return { error: "You've scheduled several gatherings recently. Please try again later." };
  const d = parsed.data;

  // datetime-local is the member's wall-clock time; the browser sends its UTC offset.
  const startsAt = new Date(Date.parse(`${d.startsLocal}:00Z`) + d.tzOffset * 60_000);
  if (Number.isNaN(startsAt.getTime()) || startsAt.getTime() < Date.now() - 5 * 60_000) return { error: "Choose a time in the future." };

  const db = getDb();
  let circleId: string | null = null;
  let projectId: string | null = null;
  if (d.where?.startsWith("circle:")) {
    const c = db.select().from(circles).where(eq(circles.id, d.where.slice(7))).get();
    if (c) circleId = c.id;
  } else if (d.where?.startsWith("project:")) {
    const p = db.select().from(projects).where(eq(projects.id, d.where.slice(8))).get();
    const member = p && db.select().from(projectMembers).where(and(eq(projectMembers.projectId, p.id), eq(projectMembers.userId, user.id))).get();
    if (!member) return { error: "Only project members can schedule gatherings for a project." };
    projectId = p!.id;
  }

  let provider: "smartmeet" | "link" | "none" = d.link ? "link" : "none";
  let joinUrl: string | null = d.link || null;
  let externalId: string | null = null;
  if (env.smartmeetEnabled() && !d.link) {
    try {
      const host = db.select({ email: users.email }).from(users).where(eq(users.id, user.id)).get()!;
      const meeting = await createSmartMeetMeeting({ title: d.title, description: d.description, startsAt, organizerName: user.name, organizerEmail: host.email });
      provider = "smartmeet";
      joinUrl = meeting.joinUrl;
      externalId = meeting.meetingId;
    } catch (err) {
      console.error("[smartmeet] create failed", err instanceof Error ? err.message : err);
      return { error: "SmartMeet couldn't create the room just now. Add your own meeting link, or try again." };
    }
  }

  const id = newId("gth");
  db.insert(gatherings)
    .values({ id, title: d.title, description: d.description, hostId: user.id, circleId, projectId, startsAt, durationMin: d.durationMin, provider, joinUrl, externalId })
    .run();
  db.insert(gatheringRsvps).values({ gatheringId: id, userId: user.id }).run();
  audit(user.id, "gathering.created", id, { provider });
  revalidatePath("/community", "layout");
  redirect(`/community/gatherings?created=${provider}`);
}

export async function toggleRsvpAction(form: FormData) {
  const user = await requireUser("/community/gatherings");
  const gatheringId = String(form.get("gatheringId") ?? "");
  const db = getDb();
  const existing = db.select().from(gatheringRsvps).where(and(eq(gatheringRsvps.gatheringId, gatheringId), eq(gatheringRsvps.userId, user.id))).get();
  if (existing) db.delete(gatheringRsvps).where(and(eq(gatheringRsvps.gatheringId, gatheringId), eq(gatheringRsvps.userId, user.id))).run();
  else if (db.select({ id: gatherings.id }).from(gatherings).where(eq(gatherings.id, gatheringId)).get()) {
    db.insert(gatheringRsvps).values({ gatheringId, userId: user.id }).run();
  }
  revalidatePath("/community", "layout");
}

export async function setGatheringLinkAction(form: FormData) {
  const user = await requireUser("/community/gatherings");
  const gatheringId = String(form.get("gatheringId") ?? "");
  const link = z.url().startsWith("https://").safeParse(String(form.get("link") ?? "").trim());
  const db = getDb();
  const g = db.select().from(gatherings).where(eq(gatherings.id, gatheringId)).get();
  if (!g || g.hostId !== user.id || !link.success) return;
  db.update(gatherings).set({ joinUrl: link.data, provider: "link" }).where(eq(gatherings.id, gatheringId)).run();
  revalidatePath("/community", "layout");
}

export async function cancelGatheringAction(form: FormData) {
  const user = await requireUser("/community/gatherings");
  const gatheringId = String(form.get("gatheringId") ?? "");
  const db = getDb();
  const g = db.select().from(gatherings).where(eq(gatherings.id, gatheringId)).get();
  if (!g || (g.hostId !== user.id && user.role !== "admin")) return;
  db.update(gatherings).set({ cancelled: true }).where(eq(gatherings.id, gatheringId)).run();
  audit(user.id, "gathering.cancelled", gatheringId);
  revalidatePath("/community", "layout");
}
