import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "./db";
import { courseModules, courses, enrollments, lessonProgress, lessons } from "./db/schema";

export function listCourses() {
  const db = getDb();
  return db
    .select({
      course: courses,
      lessonCount: sql<number>`(select count(*) from ${lessons} where ${lessons.courseId} = ${courses.id})`,
    })
    .from(courses)
    .where(eq(courses.published, true))
    .orderBy(asc(courses.position))
    .all()
    .map((r) => ({ ...r.course, lessonCount: Number(r.lessonCount) }));
}

export type CourseListItem = ReturnType<typeof listCourses>[number];

export function getCourse(slug: string) {
  const db = getDb();
  const course = db.select().from(courses).where(and(eq(courses.slug, slug), eq(courses.published, true))).get();
  if (!course) return null;
  const mods = db.select().from(courseModules).where(eq(courseModules.courseId, course.id)).orderBy(asc(courseModules.position)).all();
  const all = db.select().from(lessons).where(eq(lessons.courseId, course.id)).orderBy(asc(lessons.position)).all();
  const modules = mods.map((m) => ({ ...m, lessons: all.filter((l) => l.moduleId === m.id) }));
  const ordered = modules.flatMap((m) => m.lessons);
  return { course, modules, lessons: ordered };
}

export function enrollmentFor(userId: string, courseId: string) {
  return getDb()
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
    .get() ?? null;
}

export function completedLessonIds(userId: string, lessonIds: string[]): Set<string> {
  if (lessonIds.length === 0) return new Set();
  const rows = getDb()
    .select({ id: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), inArray(lessonProgress.lessonId, lessonIds)))
    .all();
  return new Set(rows.map((r) => r.id));
}

/** The member's courses with progress, most recently enrolled first. */
export function myCourses(userId: string) {
  const db = getDb();
  const rows = db
    .select({ course: courses, enrolledAt: enrollments.createdAt, completedAt: enrollments.completedAt })
    .from(enrollments)
    .innerJoin(courses, eq(courses.id, enrollments.courseId))
    .where(eq(enrollments.userId, userId))
    .orderBy(sql`${enrollments.createdAt} desc`)
    .all();
  return rows.map((r) => {
    const total = Number(
      db.select({ n: sql<number>`count(*)` }).from(lessons).where(eq(lessons.courseId, r.course.id)).get()?.n ?? 0,
    );
    const done = Number(
      db
        .select({ n: sql<number>`count(*)` })
        .from(lessonProgress)
        .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
        .where(and(eq(lessonProgress.userId, userId), eq(lessons.courseId, r.course.id)))
        .get()?.n ?? 0,
    );
    return { ...r.course, enrolledAt: r.enrolledAt, completedAt: r.completedAt, total, done };
  });
}

/** A lesson is open to everyone if it's a preview; otherwise only to enrolled members. */
export function canViewLesson(lesson: { isPreview: boolean }, enrolled: boolean) {
  return lesson.isPreview || enrolled;
}
