import { and, desc, eq, gt, sql } from "drizzle-orm";
import { getDb } from "./db";
import { subscriptions, usageEvents } from "./db/schema";
import { newId } from "./ids";
import { PLANS, type PlanKey, type PlanLimits } from "./plans";

const DAY_MS = 24 * 60 * 60 * 1000;

export function activeSubscription(userId: string) {
  return (
    getDb()
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active"), gt(subscriptions.currentPeriodEnd, new Date())))
      .orderBy(desc(subscriptions.currentPeriodEnd))
      .get() ?? null
  );
}

export function planFor(userId: string): PlanKey {
  return activeSubscription(userId) ? "initiate" : "seeker";
}

export function limitsFor(userId: string): PlanLimits & { plan: PlanKey } {
  const plan = planFor(userId);
  return { plan, ...PLANS[plan].limits };
}

type UsageKind = "chat_message" | "voice_seconds" | "video_seconds";

export function usedSince(userId: string, kind: UsageKind, since: Date): number {
  const row = getDb()
    .select({ total: sql<number>`coalesce(sum(${usageEvents.amount}), 0)` })
    .from(usageEvents)
    .where(and(eq(usageEvents.userId, userId), eq(usageEvents.kind, kind), gt(usageEvents.createdAt, since)))
    .get();
  return Number(row?.total ?? 0);
}

export function recordUsage(userId: string, kind: UsageKind, amount: number): string | null {
  if (amount <= 0) return null;
  const id = newId("use");
  getDb().insert(usageEvents).values({ id, userId, kind, amount: Math.round(amount) }).run();
  return id;
}

/** Gives back a reserved unit when the provider failed before answering. */
export function refundUsage(id: string | null) {
  if (id) getDb().delete(usageEvents).where(eq(usageEvents.id, id)).run();
}

export type Allowance = { limit: number; used: number; remaining: number };

function allowance(limit: number, used: number): Allowance {
  return { limit, used, remaining: Math.max(0, limit - used) };
}

/** Text messages in any rolling 24 hours. */
export function chatAllowance(userId: string): Allowance {
  const { chatMessagesPerDay } = limitsFor(userId);
  return allowance(chatMessagesPerDay, usedSince(userId, "chat_message", new Date(Date.now() - DAY_MS)));
}

/** Voice seconds in any rolling 24 hours. */
export function voiceAllowance(userId: string): Allowance {
  const { voiceSecondsPerDay } = limitsFor(userId);
  return allowance(voiceSecondsPerDay, usedSince(userId, "voice_seconds", new Date(Date.now() - DAY_MS)));
}

/** Video seconds in any rolling 30 days. */
export function videoAllowance(userId: string): Allowance {
  const { videoSecondsPerMonth } = limitsFor(userId);
  return allowance(videoSecondsPerMonth, usedSince(userId, "video_seconds", new Date(Date.now() - 30 * DAY_MS)));
}
