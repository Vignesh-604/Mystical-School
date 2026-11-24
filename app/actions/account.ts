"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { verifyPassword } from "@/lib/auth/password";
import { endSession, requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { guideConversations, journeys, users } from "@/lib/db/schema";

export type AccountState = { error?: string; ok?: boolean } | undefined;

const profileSchema = z.object({
  name: z.string().trim().min(1, "Please add your name.").max(80),
  location: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(400).optional(),
});

export async function updateProfileAction(_prev: AccountState, form: FormData): Promise<AccountState> {
  const user = await requireUser("/account");
  const parsed = profileSchema.safeParse({ name: form.get("name"), location: form.get("location") || undefined, bio: form.get("bio") || undefined });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  getDb()
    .update(users)
    .set({ name: parsed.data.name, location: parsed.data.location ?? null, bio: parsed.data.bio ?? null })
    .where(eq(users.id, user.id))
    .run();
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function clearGuideHistoryAction() {
  const user = await requireUser("/account");
  const db = getDb();
  db.delete(guideConversations).where(eq(guideConversations.userId, user.id)).run();
  db.update(journeys).set({ memorySummary: null, memoryUpdatedAt: null }).where(eq(journeys.userId, user.id)).run();
  audit(user.id, "guide.history_cleared", user.id);
  revalidatePath("/guide");
  redirect("/account?saved=history");
}

export async function deleteAccountAction(_prev: AccountState, form: FormData): Promise<AccountState> {
  const user = await requireUser("/account");
  if (form.get("confirm") !== "DELETE") return { error: "Type DELETE to confirm." };
  const row = getDb().select().from(users).where(eq(users.id, user.id)).get();
  if (!row || !(await verifyPassword(String(form.get("password") ?? ""), row.passwordHash))) return { error: "That password isn't right." };
  if (row.role === "admin") return { error: "Admin accounts can't be deleted from here." };
  audit(null, "user.deleted", user.id);
  await endSession();
  // Cascades remove sessions, journey, conversations, journal, enrolments, bookings, posts and memberships.
  getDb().delete(users).where(eq(users.id, user.id)).run();
  redirect("/?deleted=1");
}
