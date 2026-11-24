import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "../db";
import { sessions, users, type User } from "../db/schema";

export const SESSION_COOKIE = "ms_session";
const SESSION_DAYS = 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export type SessionUser = Pick<User, "id" | "email" | "name" | "role" | "bio" | "location" | "createdAt">;

/** Creates a session and sets the cookie. Call only from server actions or route handlers. */
export async function startSession(userId: string) {
  const db = getDb();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  db.insert(sessions).values({ id: hashToken(token), userId, expiresAt }).run();
  // Housekeeping: drop this user's expired sessions.
  db.delete(sessions).where(and(eq(sessions.userId, userId), lt(sessions.expiresAt, new Date()))).run();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) getDb().delete(sessions).where(eq(sessions.id, hashToken(token))).run();
  jar.delete(SESSION_COOKIE);
}

export function userForToken(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const row = getDb()
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      bio: users.bio,
      location: users.location,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .get();
  return row ?? null;
}

/** The signed-in member for this request, or null. Cached per request. */
export const currentUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  return userForToken(jar.get(SESSION_COOKIE)?.value);
});

export async function requireUser(returnTo?: string): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) redirect(returnTo ? `/sign-in?next=${encodeURIComponent(returnTo)}` : "/sign-in");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser("/admin");
  if (user.role !== "admin") redirect("/");
  return user;
}

/** Only allow same-site relative paths as post-login destinations. */
export function safeNext(next: unknown, fallback = "/home"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
