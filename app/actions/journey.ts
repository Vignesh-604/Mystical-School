"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { journeys } from "@/lib/db/schema";
import { STUDY_AREA_BY_KEY } from "@/lib/study-areas";

export type JourneyState = { error?: string } | undefined;

const schema = z.object({
  intention: z.string().trim().min(3, "Share a few words about what brings you here.").max(600),
  focusAreas: z
    .array(z.string().refine((k) => k in STUDY_AREA_BY_KEY))
    .min(1, "Choose at least one area to begin with.")
    .max(3, "Choose up to three areas for now."),
  experience: z.enum(["new", "some", "practising", "teaching"], { message: "Choose the option closest to you." }),
  traditions: z.string().trim().max(300).optional(),
});

export async function saveJourneyAction(_prev: JourneyState, form: FormData): Promise<JourneyState> {
  const user = await requireUser("/onboarding");
  const parsed = schema.safeParse({
    intention: form.get("intention"),
    focusAreas: form.getAll("focusAreas").map(String),
    experience: form.get("experience"),
    traditions: form.get("traditions") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const db = getDb();
  const existing = db.select().from(journeys).where(eq(journeys.userId, user.id)).get();
  const values = {
    intention: parsed.data.intention,
    focusAreas: parsed.data.focusAreas,
    experience: parsed.data.experience,
    traditions: parsed.data.traditions ?? null,
    onboardedAt: existing?.onboardedAt ?? new Date(),
  };
  if (existing) db.update(journeys).set(values).where(eq(journeys.userId, user.id)).run();
  else db.insert(journeys).values({ userId: user.id, ...values }).run();

  revalidatePath("/home");
  redirect(form.get("returnTo") === "account" ? "/account?saved=journey" : "/home?welcome=1");
}
