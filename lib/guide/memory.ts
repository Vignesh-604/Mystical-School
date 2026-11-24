import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { journeys } from "../db/schema";
import { env } from "../env";
import { complete } from "./openrouter";
import { conversationMessages } from "./store";

/**
 * Keeps Sophia's short private notes on a member's journey (Initiate plan).
 * Runs after a response has been sent, so it never slows the conversation.
 */
export async function refreshMemory(userId: string, conversationId: string) {
  const db = getDb();
  const journey = db.select().from(journeys).where(eq(journeys.userId, userId)).get();
  const recent = conversationMessages(conversationId, 14)
    .filter((m) => !m.safetyFlag)
    .map((m) => `${m.role === "user" ? "Member" : "Sophia"}: ${m.content.slice(0, 1200)}`)
    .join("\n\n");
  if (!recent) return;

  const summary = await complete(
    [
      {
        role: "system",
        content:
          "You maintain a guide's private notes about one member's spiritual journey, so the guide can offer continuity. Write at most 150 words as short bullet points: themes they're exploring, practices they've tried and how it went, commitments they've made, what seems to help them. Be kind and factual. Leave out sensitive details (health, crisis, trauma specifics, third parties' private information) and anything not useful for future guidance. Output only the bullet points.",
      },
      {
        role: "user",
        content: `Existing notes:\n${journey?.memorySummary || "(none yet)"}\n\nRecent conversation:\n${recent}\n\nUpdated notes:`,
      },
    ],
    { model: env.guideModelUtility(), maxTokens: 350 },
  );
  if (summary) {
    db.update(journeys).set({ memorySummary: summary.slice(0, 1500), memoryUpdatedAt: new Date() }).where(eq(journeys.userId, userId)).run();
  }
}
