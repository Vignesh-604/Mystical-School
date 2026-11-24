"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { DUMMY_HASH, hashPassword, verifyPassword } from "@/lib/auth/password";
import { rateLimit } from "@/lib/auth/rate-limit";
import { endSession, safeNext, startSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { journeys, users } from "@/lib/db/schema";
import { newId } from "@/lib/ids";

export type AuthState = { error?: string; fields?: Record<string, string> } | undefined;

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name.").max(80, "That name is a little long."),
  email: z.email("Please enter a valid email address.").trim().toLowerCase().max(200),
  password: z
    .string()
    .min(10, "Use at least 10 characters.")
    .max(200, "That password is too long."),
});

async function clientKey() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

export async function signUpAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const raw = { name: String(form.get("name") ?? ""), email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") };
  const fields = { name: raw.name, email: raw.email };
  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, fields };

  const ip = await clientKey();
  if (!rateLimit(`signup:${ip}`, 10, 60 * 60 * 1000).ok) {
    return { error: "Too many sign-ups from this connection. Please try again later.", fields };
  }

  const db = getDb();
  const existing = db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email)).get();
  if (existing) return { error: "An account with this email already exists. Try signing in.", fields };

  const id = newId("usr");
  const passwordHash = await hashPassword(parsed.data.password);
  db.transaction((tx) => {
    tx.insert(users).values({ id, email: parsed.data.email, name: parsed.data.name, passwordHash }).run();
    tx.insert(journeys).values({ userId: id }).run();
  });
  audit(id, "user.signed_up", id);
  await startSession(id);
  redirect("/onboarding");
}

const signInSchema = z.object({
  email: z.email("Please enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(1, "Please enter your password.").max(200),
});

export async function signInAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const raw = { email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") };
  const fields = { email: raw.email };
  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, fields };

  const ip = await clientKey();
  const byEmail = rateLimit(`signin:${parsed.data.email}`, 6, 10 * 60 * 1000);
  const byIp = rateLimit(`signin-ip:${ip}`, 30, 10 * 60 * 1000);
  if (!byEmail.ok || !byIp.ok) {
    return { error: "Too many attempts. Please wait a few minutes and try again.", fields };
  }

  const user = getDb().select().from(users).where(eq(users.email, parsed.data.email)).get();
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return { error: "That email and password don't match.", fields };

  await startSession(user.id);
  redirect(safeNext(form.get("next")));
}

export async function signOutAction() {
  await endSession();
  redirect("/");
}
