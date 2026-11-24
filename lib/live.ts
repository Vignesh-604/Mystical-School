import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "./db";
import { liveSessions } from "./db/schema";
import { newId } from "./ids";
import { recordUsage } from "./membership";

type Kind = "voice" | "video";

/** Seconds actually used, measured on the server and capped at the session maximum. */
function elapsedSeconds(startedAt: Date, maxSeconds: number) {
  return Math.min(maxSeconds, Math.max(0, Math.round((Date.now() - startedAt.getTime()) / 1000)));
}

/** Ends any open session of this kind (a new tab, a lost connection) and charges what it used. */
export function closeOpenSessions(userId: string, kind: Kind) {
  const db = getDb();
  const open = db
    .select()
    .from(liveSessions)
    .where(and(eq(liveSessions.userId, userId), eq(liveSessions.kind, kind), isNull(liveSessions.endedAt)))
    .all();
  for (const s of open) {
    const charged = elapsedSeconds(s.startedAt, s.maxSeconds);
    db.update(liveSessions).set({ endedAt: new Date(), chargedSeconds: charged }).where(eq(liveSessions.id, s.id)).run();
    recordUsage(userId, kind === "voice" ? "voice_seconds" : "video_seconds", charged);
  }
  return open;
}

export function startLiveSession(userId: string, kind: Kind, maxSeconds: number, providerRef?: string) {
  const id = newId(kind === "voice" ? "vce" : "vid");
  getDb()
    .insert(liveSessions)
    .values({ id, userId, kind, maxSeconds, startedAt: new Date(), providerRef: providerRef ?? null })
    .run();
  return id;
}

export function setProviderRef(id: string, providerRef: string) {
  getDb().update(liveSessions).set({ providerRef }).where(eq(liveSessions.id, id)).run();
}

export function endLiveSession(id: string, userId: string) {
  const db = getDb();
  const s = db.select().from(liveSessions).where(and(eq(liveSessions.id, id), eq(liveSessions.userId, userId))).get();
  if (!s) return null;
  if (s.endedAt) return s;
  const charged = elapsedSeconds(s.startedAt, s.maxSeconds);
  db.update(liveSessions).set({ endedAt: new Date(), chargedSeconds: charged }).where(eq(liveSessions.id, id)).run();
  recordUsage(userId, s.kind === "voice" ? "voice_seconds" : "video_seconds", charged);
  return { ...s, endedAt: new Date(), chargedSeconds: charged };
}

export function attachConversation(id: string, conversationId: string) {
  getDb().update(liveSessions).set({ conversationId }).where(eq(liveSessions.id, id)).run();
}
