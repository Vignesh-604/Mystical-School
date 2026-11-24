"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { journalEntries } from "@/lib/db/schema";
import { deleteConversation, ownedConversation } from "@/lib/guide/store";
import { newId } from "@/lib/ids";

const saveSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(8000),
  kind: z.enum(["reflection", "practice", "action", "insight"]),
  source: z.string().max(80).optional(),
});

/** Saves something meaningful (a reply from Sophia, a reflection) to the member's private journal. */
export async function saveToJournalAction(input: z.input<typeof saveSchema>) {
  const user = await requireUser();
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Couldn't save that entry." };
  getDb()
    .insert(journalEntries)
    .values({ id: newId("jrn"), userId: user.id, ...parsed.data, source: parsed.data.source ?? "guide" })
    .run();
  revalidatePath("/journal");
  return { ok: true as const };
}

export async function deleteConversationAction(conversationId: string) {
  const user = await requireUser();
  if (!ownedConversation(user.id, conversationId)) return { ok: false as const };
  deleteConversation(user.id, conversationId);
  revalidatePath("/guide");
  return { ok: true as const };
}
