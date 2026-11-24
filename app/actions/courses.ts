"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { canViewLesson, enrollmentFor } from "@/lib/courses";
import { getDb } from "@/lib/db";
import { courses, enrollments, journalEntries, lessonProgress, lessons } from "@/lib/db/schema";
import { newId } from "@/lib/ids";

const schema = z.object({
  lessonId: z.string().min(1).max(64),
  reflection: z.string().trim().max(4000).optional(),
  saveToJournal: z.boolean(),
  next: z.string().max(300).optional(),
});

export async function completeLessonAction(form: FormData) {
  const user = await requireUser();
  const parsed = schema.safeParse({
    lessonId: form.get("lessonId"),
    reflection: form.get("reflection") || undefined,
    saveToJournal: form.get("saveToJournal") === "on",
    next: form.get("next") || undefined,
  });
  if (!parsed.success) redirect("/courses");
  const { lessonId, reflection, saveToJournal, next } = parsed.data;

  const db = getDb();
  const lesson = db.select().from(lessons).where(eq(lessons.id, lessonId)).get();
  if (!lesson) redirect("/courses");
  const course = db.select().from(courses).where(eq(courses.id, lesson.courseId)).get()!;
  const enrolled = enrollmentFor(user.id, course.id);
  if (!canViewLesson(lesson, Boolean(enrolled))) redirect(`/courses/${course.slug}`);

  db.insert(lessonProgress)
    .values({ userId: user.id, lessonId, completedAt: new Date(), reflection: reflection ?? null })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: { reflection: reflection ?? null },
    })
    .run();

  if (reflection && saveToJournal) {
    db.insert(journalEntries)
      .values({
        id: newId("jrn"),
        userId: user.id,
        kind: "action",
        title: `${lesson.title}: my reflection`,
        body: `**Wisdom in Action:** ${lesson.actionPrompt}\n\n${reflection}`,
        studyArea: course.studyArea,
        source: `lesson:${lesson.id}`,
      })
      .run();
  }

  if (enrolled && !enrolled.completedAt) {
    const total = Number(db.select({ n: sql<number>`count(*)` }).from(lessons).where(eq(lessons.courseId, course.id)).get()?.n ?? 0);
    const done = Number(
      db
        .select({ n: sql<number>`count(*)` })
        .from(lessonProgress)
        .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
        .where(and(eq(lessonProgress.userId, user.id), eq(lessons.courseId, course.id)))
        .get()?.n ?? 0,
    );
    if (total > 0 && done >= total) db.update(enrollments).set({ completedAt: new Date() }).where(eq(enrollments.id, enrolled.id)).run();
  }

  revalidatePath(`/courses/${course.slug}`);
  const safe = next && next.startsWith(`/courses/${course.slug}`) ? next : `/courses/${course.slug}`;
  redirect(safe);
}
