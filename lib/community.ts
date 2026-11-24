import { and, asc, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { getDb } from "./db";
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
  users,
} from "./db/schema";

export function listCircles(viewerId?: string) {
  const db = getDb();
  const rows = db
    .select({
      circle: circles,
      members: sql<number>`(select count(*) from ${circleMembers} where ${circleMembers.circleId} = ${circles.id})`,
      postCount: sql<number>`(select count(*) from ${posts} where ${posts.circleId} = ${circles.id} and ${posts.hidden} = 0)`,
    })
    .from(circles)
    .orderBy(asc(circles.position))
    .all();
  const joined = viewerId
    ? new Set(db.select({ id: circleMembers.circleId }).from(circleMembers).where(eq(circleMembers.userId, viewerId)).all().map((r) => r.id))
    : new Set<string>();
  return rows.map((r) => ({ ...r.circle, members: Number(r.members), postCount: Number(r.postCount), joined: joined.has(r.circle.id) }));
}

export function getCircle(slug: string) {
  return getDb().select().from(circles).where(eq(circles.slug, slug)).get() ?? null;
}

export function isCircleMember(circleId: string, userId: string) {
  return Boolean(
    getDb().select().from(circleMembers).where(and(eq(circleMembers.circleId, circleId), eq(circleMembers.userId, userId))).get(),
  );
}

export type FeedPost = {
  id: string;
  body: string;
  createdAt: Date;
  author: { id: string; name: string };
  circle: { slug: string; name: string };
  resonates: number;
  resonated: boolean;
  comments: { id: string; body: string; createdAt: Date; author: { id: string; name: string } }[];
};

/** Posts with authors, comments and reactions, newest first. Hidden content is excluded. */
export function feed(opts: { circleId?: string; viewerId?: string; limit?: number }): FeedPost[] {
  const db = getDb();
  const rows = db
    .select({
      id: posts.id,
      body: posts.body,
      createdAt: posts.createdAt,
      authorId: users.id,
      authorName: users.name,
      circleSlug: circles.slug,
      circleName: circles.name,
    })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .innerJoin(circles, eq(circles.id, posts.circleId))
    .where(and(eq(posts.hidden, false), opts.circleId ? eq(posts.circleId, opts.circleId) : undefined))
    .orderBy(desc(posts.createdAt))
    .limit(opts.limit ?? 30)
    .all();
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const counts = new Map(
    db
      .select({ postId: reactions.postId, n: sql<number>`count(*)` })
      .from(reactions)
      .where(inArray(reactions.postId, ids))
      .groupBy(reactions.postId)
      .all()
      .map((r) => [r.postId, Number(r.n)]),
  );
  const mine = opts.viewerId
    ? new Set(
        db
          .select({ postId: reactions.postId })
          .from(reactions)
          .where(and(inArray(reactions.postId, ids), eq(reactions.userId, opts.viewerId)))
          .all()
          .map((r) => r.postId),
      )
    : new Set<string>();
  const allComments = db
    .select({ id: comments.id, postId: comments.postId, body: comments.body, createdAt: comments.createdAt, authorId: users.id, authorName: users.name })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.authorId))
    .where(and(inArray(comments.postId, ids), eq(comments.hidden, false)))
    .orderBy(asc(comments.createdAt))
    .all();
  return rows.map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: r.createdAt,
    author: { id: r.authorId, name: r.authorName },
    circle: { slug: r.circleSlug, name: r.circleName },
    resonates: counts.get(r.id) ?? 0,
    resonated: mine.has(r.id),
    comments: allComments
      .filter((c) => c.postId === r.id)
      .map((c) => ({ id: c.id, body: c.body, createdAt: c.createdAt, author: { id: c.authorId, name: c.authorName } })),
  }));
}

export function listProjects() {
  return getDb()
    .select({
      project: projects,
      ownerName: users.name,
      members: sql<number>`(select count(*) from ${projectMembers} where ${projectMembers.projectId} = ${projects.id})`,
    })
    .from(projects)
    .innerJoin(users, eq(users.id, projects.ownerId))
    .orderBy(sql`case ${projects.status} when 'active' then 0 when 'forming' then 1 else 2 end`, desc(projects.createdAt))
    .all()
    .map((r) => ({ ...r.project, ownerName: r.ownerName, members: Number(r.members) }));
}

export function getProject(slug: string) {
  const db = getDb();
  const project = db.select().from(projects).where(eq(projects.slug, slug)).get();
  if (!project) return null;
  const members = db
    .select({ id: users.id, name: users.name, location: users.location, role: projectMembers.role })
    .from(projectMembers)
    .innerJoin(users, eq(users.id, projectMembers.userId))
    .where(eq(projectMembers.projectId, project.id))
    .orderBy(asc(projectMembers.joinedAt))
    .all();
  const updates = db
    .select({ id: projectUpdates.id, body: projectUpdates.body, createdAt: projectUpdates.createdAt, authorId: users.id, authorName: users.name })
    .from(projectUpdates)
    .innerJoin(users, eq(users.id, projectUpdates.authorId))
    .where(and(eq(projectUpdates.projectId, project.id), eq(projectUpdates.hidden, false)))
    .orderBy(desc(projectUpdates.createdAt))
    .all();
  return { project, members, updates };
}

export function upcomingGatherings(opts: { viewerId?: string; projectId?: string; circleId?: string; limit?: number } = {}) {
  const db = getDb();
  const rows = db
    .select({
      g: gatherings,
      hostName: users.name,
      circleName: circles.name,
      circleSlug: circles.slug,
      projectTitle: projects.title,
      projectSlug: projects.slug,
      going: sql<number>`(select count(*) from ${gatheringRsvps} where ${gatheringRsvps.gatheringId} = ${gatherings.id})`,
    })
    .from(gatherings)
    .innerJoin(users, eq(users.id, gatherings.hostId))
    .leftJoin(circles, eq(circles.id, gatherings.circleId))
    .leftJoin(projects, eq(projects.id, gatherings.projectId))
    .where(
      and(
        eq(gatherings.cancelled, false),
        // Keep a gathering visible until it has finished.
        gt(sql`${gatherings.startsAt} + ${gatherings.durationMin} * 60000`, Date.now()),
        opts.projectId ? eq(gatherings.projectId, opts.projectId) : undefined,
        opts.circleId ? eq(gatherings.circleId, opts.circleId) : undefined,
      ),
    )
    .orderBy(asc(gatherings.startsAt))
    .limit(opts.limit ?? 50)
    .all();
  const mine = opts.viewerId
    ? new Set(db.select({ id: gatheringRsvps.gatheringId }).from(gatheringRsvps).where(eq(gatheringRsvps.userId, opts.viewerId)).all().map((r) => r.id))
    : new Set<string>();
  return rows.map((r) => ({
    ...r.g,
    hostName: r.hostName,
    circle: r.circleSlug ? { slug: r.circleSlug, name: r.circleName! } : null,
    project: r.projectSlug ? { slug: r.projectSlug, title: r.projectTitle! } : null,
    going: Number(r.going),
    attending: mine.has(r.g.id),
  }));
}

export function memberProfile(userId: string) {
  const db = getDb();
  const user = db
    .select({ id: users.id, name: users.name, bio: users.bio, location: users.location, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userId))
    .get();
  if (!user) return null;
  const memberCircles = db
    .select({ slug: circles.slug, name: circles.name })
    .from(circleMembers)
    .innerJoin(circles, eq(circles.id, circleMembers.circleId))
    .where(eq(circleMembers.userId, userId))
    .all();
  const memberProjects = db
    .select({ slug: projects.slug, title: projects.title, role: projectMembers.role })
    .from(projectMembers)
    .innerJoin(projects, eq(projects.id, projectMembers.projectId))
    .where(eq(projectMembers.userId, userId))
    .all();
  const recent = db
    .select({ id: posts.id, body: posts.body, createdAt: posts.createdAt, circleSlug: circles.slug, circleName: circles.name })
    .from(posts)
    .innerJoin(circles, eq(circles.id, posts.circleId))
    .where(and(eq(posts.authorId, userId), eq(posts.hidden, false)))
    .orderBy(desc(posts.createdAt))
    .limit(5)
    .all();
  return { user, circles: memberCircles, projects: memberProjects, recent };
}
