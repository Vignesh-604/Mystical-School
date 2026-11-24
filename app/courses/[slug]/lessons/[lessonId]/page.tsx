import { and, eq } from "drizzle-orm";
import { ArrowLeft, ArrowRight, CheckCircle2, HandHeart, Leaf, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { completeLessonAction } from "@/app/actions/courses";
import { Markdown } from "@/components/markdown";
import { PendingButton } from "@/components/pending-button";
import { Badge, Container, LinkButton, Textarea } from "@/components/ui";
import { currentUser } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import { canViewLesson, completedLessonIds, enrollmentFor, getCourse } from "@/lib/courses";
import { getDb } from "@/lib/db";
import { lessonProgress } from "@/lib/db/schema";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const { slug, lessonId } = await params;
  const lesson = getCourse(slug)?.lessons.find((l) => l.id === lessonId);
  return { title: lesson?.title ?? "Lesson" };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const { slug, lessonId } = await params;
  const data = getCourse(slug);
  if (!data) notFound();
  const { course, modules, lessons } = data;
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index < 0) notFound();
  const lesson = lessons[index]!;

  const user = await currentUser();
  const enrolled = user ? Boolean(enrollmentFor(user.id, course.id)) : false;
  if (!canViewLesson(lesson, enrolled)) redirect(`/courses/${course.slug}`);

  const done = user ? completedLessonIds(user.id, lessons.map((l) => l.id)) : new Set<string>();
  const progress = user
    ? getDb().select().from(lessonProgress).where(and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonId, lesson.id))).get()
    : null;
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const nextOpen = next && canViewLesson(next, enrolled);
  const moduleOf = modules.find((m) => m.id === lesson.moduleId);

  return (
    <Container className="grid gap-10 py-10 lg:grid-cols-[17rem_1fr]">
      {/* Curriculum */}
      <aside className="order-2 lg:order-1 lg:sticky lg:top-24 lg:self-start">
        <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-4" /> {course.title}
        </Link>
        <nav aria-label="Lessons" className="mt-5 space-y-5">
          {modules.map((m) => (
            <div key={m.id}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{m.title}</p>
              <ul className="mt-2 space-y-0.5">
                {m.lessons.map((l) => {
                  const open = canViewLesson(l, enrolled);
                  return (
                    <li key={l.id}>
                      {open ? (
                        <Link
                          href={`/courses/${course.slug}/lessons/${l.id}`}
                          aria-current={l.id === lesson.id ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
                            l.id === lesson.id ? "bg-surface-2 text-ink" : "text-ink-2 hover:bg-surface-2/60",
                          )}
                        >
                          {done.has(l.id) ? <CheckCircle2 className="size-3.5 shrink-0 text-sage" /> : <span className="size-3.5 shrink-0 rounded-full border border-line-strong" />}
                          <span className="truncate">{l.title}</span>
                        </Link>
                      ) : (
                        <span className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted">
                          <Lock className="size-3.5 shrink-0" />
                          <span className="truncate">{l.title}</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Lesson */}
      <article className="order-1 max-w-2xl lg:order-2">
        <p className="text-sm text-muted">
          {moduleOf?.title} · Lesson {index + 1} of {lessons.length} · {lesson.durationMin} min
        </p>
        <h1 className="font-display mt-2 text-5xl font-semibold leading-[1.05]">{lesson.title}</h1>
        {!enrolled ? (
          <p className="mt-3">
            <Badge tone="gold">Free preview lesson</Badge>
          </p>
        ) : null}

        <Markdown text={lesson.body} className="prose-ms mt-8" />

        <section className="mt-10 rounded-2xl border border-sage/30 bg-sage-soft/50 p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-sage">
            <Leaf className="size-4" /> Practice
          </p>
          <p className="mt-2 leading-relaxed text-ink">{lesson.practice}</p>
        </section>

        <section className="mt-4 rounded-2xl border border-gold/30 bg-gold-soft/40 p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-gold-ink">
            <HandHeart className="size-4" /> Wisdom in Action
          </p>
          <p className="mt-2 leading-relaxed text-ink">{lesson.actionPrompt}</p>
        </section>

        {user ? (
          <form action={completeLessonAction} className="mt-8 space-y-4">
            <input type="hidden" name="lessonId" value={lesson.id} />
            {nextOpen ? <input type="hidden" name="next" value={`/courses/${course.slug}/lessons/${next.id}`} /> : null}
            <label htmlFor="reflection" className="block text-sm font-medium text-ink">
              Your reflection <span className="font-normal text-muted">(optional, private)</span>
            </label>
            <Textarea
              id="reflection"
              name="reflection"
              rows={4}
              maxLength={4000}
              defaultValue={progress?.reflection ?? ""}
              placeholder="What did you notice when you tried the practice? What will you do for someone else?"
            />
            <label className="flex items-center gap-2 text-sm text-ink-2">
              <input type="checkbox" name="saveToJournal" defaultChecked className="size-4 accent-[var(--gold)]" />
              Also save my reflection to my journal
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <PendingButton pendingLabel="Saving…">
                {done.has(lesson.id) ? "Update reflection" : nextOpen ? "Complete and continue" : "Mark complete"}
              </PendingButton>
              <Link
                href={`/guide?new=1&ask=${encodeURIComponent(`I'm working on the lesson "${lesson.title}" in ${course.title}. `)}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
              >
                <Sparkles className="size-4 text-gold" /> Ask Sophia about this lesson
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
            <p className="font-medium text-ink">Enjoying this lesson?</p>
            <p className="mt-1 text-sm text-muted">Join free to save your reflections and keep your place.</p>
            <LinkButton href="/sign-up" className="mt-4">
              Join free
            </LinkButton>
          </div>
        )}

        <nav aria-label="Lesson navigation" className="mt-12 flex items-center justify-between border-t border-line pt-6 text-sm">
          {prev ? (
            <Link href={`/courses/${course.slug}/lessons/${prev.id}`} className="inline-flex items-center gap-1.5 text-muted hover:text-ink">
              <ArrowLeft className="size-4" /> {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            nextOpen ? (
              <Link href={`/courses/${course.slug}/lessons/${next.id}`} className="inline-flex items-center gap-1.5 text-ink hover:underline">
                {next.title} <ArrowRight className="size-4" />
              </Link>
            ) : (
              <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-1.5 text-muted hover:text-ink">
                <Lock className="size-3.5" /> Enrol to continue
              </Link>
            )
          ) : null}
        </nav>
      </article>
    </Container>
  );
}
