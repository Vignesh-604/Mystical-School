"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { journalEntries } from "@/lib/db/schema";
import { newId } from "@/lib/ids";

export type JournalState = { error?: string; ok?: boolean } | undefined;

const schema = z.object({
  title: z.string().trim().min(1, "Give your entry a short title.").max(120),
  body: z.string().trim().min(1, "Write a few words.").max(8000),
  kind: z.enum(["reflection", "practice", "action", "insight"]),
});

export async function addJournalEntryAction(_prev: JournalState, form: FormData): Promise<JournalState> {
  const user = await requireUser("/journal");
  const parsed = schema.safeParse({ title: form.get("title"), body: form.get("body"), kind: form.get("kind") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  getDb().insert(journalEntries).values({ id: newId("jrn"), userId: user.id, source: "manual", ...parsed.data }).run();
  revalidatePath("/journal");
  return { ok: true };
}

export async function deleteJournalEntryAction(form: FormData) {
  const user = await requireUser("/journal");
  const id = String(form.get("id") ?? "");
  getDb().delete(journalEntries).where(and(eq(journalEntries.id, id), eq(journalEntries.userId, user.id))).run();
  revalidatePath("/journal");
}
