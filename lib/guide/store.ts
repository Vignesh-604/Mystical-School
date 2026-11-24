import { and, asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "../db";
import { guideConversations, guideMessages } from "../db/schema";
import { newId } from "../ids";

export function titleFrom(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 48) return clean || "New conversation";
  const cut = clean.slice(0, 48);
  return cut.slice(0, cut.lastIndexOf(" ") > 20 ? cut.lastIndexOf(" ") : 48) + "…";
}

export function listConversations(userId: string, limit = 30) {
  return getDb()
    .select({
      id: guideConversations.id,
      title: guideConversations.title,
      mode: guideConversations.mode,
      updatedAt: guideConversations.updatedAt,
    })
    .from(guideConversations)
    .where(eq(guideConversations.userId, userId))
    .orderBy(desc(guideConversations.updatedAt))
    .limit(limit)
    .all();
}

/** Returns the conversation only if it belongs to the user. */
export function ownedConversation(userId: string, conversationId: string) {
  return (
    getDb()
      .select()
      .from(guideConversations)
      .where(and(eq(guideConversations.id, conversationId), eq(guideConversations.userId, userId)))
      .get() ?? null
  );
}

export function conversationMessages(conversationId: string, limit?: number) {
  const db = getDb();
  if (limit) {
    return db
      .select()
      .from(guideMessages)
      .where(eq(guideMessages.conversationId, conversationId))
      .orderBy(desc(guideMessages.createdAt))
      .limit(limit)
      .all()
      .reverse();
  }
  return db.select().from(guideMessages).where(eq(guideMessages.conversationId, conversationId)).orderBy(asc(guideMessages.createdAt)).all();
}

export function createConversation(userId: string, title: string, mode: "text" | "voice" | "video" = "text") {
  const id = newId("cnv");
  getDb().insert(guideConversations).values({ id, userId, title: titleFrom(title), mode }).run();
  return id;
}

export function addMessage(conversationId: string, role: "user" | "assistant", content: string, safetyFlag?: string | null) {
  const db = getDb();
  const id = newId("msg");
  // Millisecond timestamps can collide in a fast exchange; keep order stable.
  const last = db
    .select({ t: sql<number>`max(${guideMessages.createdAt})` })
    .from(guideMessages)
    .where(eq(guideMessages.conversationId, conversationId))
    .get();
  const now = Math.max(Date.now(), Number(last?.t ?? 0) + 1);
  db.insert(guideMessages).values({ id, conversationId, role, content, safetyFlag: safetyFlag ?? null, createdAt: new Date(now) }).run();
  db.update(guideConversations).set({ updatedAt: new Date(now) }).where(eq(guideConversations.id, conversationId)).run();
  return id;
}

export function deleteConversation(userId: string, conversationId: string) {
  getDb()
    .delete(guideConversations)
    .where(and(eq(guideConversations.id, conversationId), eq(guideConversations.userId, userId)))
    .run();
}

export function userMessageCount(conversationId: string) {
  return Number(
    getDb()
      .select({ n: sql<number>`count(*)` })
      .from(guideMessages)
      .where(and(eq(guideMessages.conversationId, conversationId), eq(guideMessages.role, "user")))
      .get()?.n ?? 0,
  );
}
