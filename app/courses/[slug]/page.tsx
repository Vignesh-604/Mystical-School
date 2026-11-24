import { CheckCircle2, Circle, Clock, Lock, PlayCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buyCourseAction } from "@/app/actions/checkout";
import { CoverArt } from "@/components/geometry";
import { PendingButton } from "@/components/pending-button";
import { Badge, Card, Container, Eyebrow, LinkButton } from "@/components/ui";
import { currentUser } from "@/lib/auth/session";
import { completedLessonIds, enrollmentFor, getCourse } from "@/lib/courses";
import { money, plural } from "@/lib/format";
import { studyArea } from "@/lib/study-areas";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const data = getCourse((await params).slug);
  return { title: data?.course.title ?? "Course" };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getCourse(slug);
  if (!data) notFound();
  const { course, modules, lessons } = data;
  const user = await currentUser();
  const enrolled = user ? enrollmentFor(user.id, course.id) : null;
  const done = user ? completedLessonIds(user.id, lessons.map((l) => l.id)) : new Set<string>();
  const nextLesson = lessons.find((l) => !done.has(l.id)) ?? lessons[0];
  const totalMinutes = lessons.reduce((n, l) => n + l.durationMin, 0);
  const area = studyArea(course.studyArea);

  return (
    <>
      <Container className="grid items-center gap-12 pb-6 pt-14 lg:grid-cols-[1.25fr_1fr] lg:pt-20">
        <div className="animate-fade-up">
          <p className="kicker">{area.name}</p>
          <h1 className="font-display mt-5 text-6xl leading-[0.95] text-ink sm:text-7xl">{course.title}</h1>
          <p className="font-display mt-4 text-3xl italic leading-snug text-gold">{course.subtitle}</p>
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="text-muted">Teacher</dt>
              <dd className="font-medium text-ink">{course.teacherName}</dd>
            </div>
            <div>
              <dt className="text-muted">Length</dt>
              <dd className="font-medium text-ink">{course.durationLabel}</dd>
            </div>
            <div>
              <dt className="text-muted">Lessons</dt>
              <dd className="font-medium text-ink">{lessons.length}</dd>
            </div>
          </dl>
        </div>
        <div className="relative mx-auto w-full max-w-sm animate-fade-up delay-2">
          <div aria-hidden className="absolute inset-x-6 -bottom-6 h-10 rounded-full bg-night/25 blur-2xl" />
          <CoverArt area={course.studyArea} seed={course.slug} className="float-slow aspect-[3/4] -rotate-2 rounded-[1.1rem] shadow-lift ring-1 ring-black/10">
            <div className="flex h-full flex-col justify-end p-7">
              <p className="font-display text-4xl leading-none">{course.title}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] opacity-75">Mystical School</p>
            </div>
          </CoverArt>
        </div>
      </Container>

      <Container className="grid gap-14 py-16 lg:grid-cols-[1fr_23rem]">
        <div>
          <p className="font-display text-[1.9rem] leading-[1.3] text-ink">{course.description}</p>

          <section className="mt-12">
            <Eyebrow>What you&rsquo;ll gain</Eyebrow>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {course.outcomes.map((o) => (
                <li key={o} className="flex gap-3 rounded-xl border border-line bg-surface p-4 text-[0.95rem] text-ink-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold" />
                  {o}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <div className="flex items-baseline justify-between">
              <Eyebrow>Curriculum</Eyebrow>
              <p className="text-sm text-muted">
                {plural(lessons.length, "lesson")} · about {Math.round(totalMinutes / 6) / 10} hours of teaching
              </p>
            </div>
            <ol className="mt-4 space-y-6">
              {modules.map((m, mi) => (
                <li key={m.id}>
                  <h2 className="font-display text-2xl">
                    <span className="mr-2 text-gold">{mi + 1}.</span>
                    {m.title}
                  </h2>
                  <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
                    {m.lessons.map((l) => {
                      const open = l.isPreview || Boolean(enrolled);
                      const complete = done.has(l.id);
                      const row = (
                        <div className="flex items-center gap-3 px-4 py-3.5">
                          {complete ? (
                            <CheckCircle2 className="size-4 shrink-0 text-sage" aria-label="Completed" />
                          ) : open ? (
                            <PlayCircle className="size-4 shrink-0 text-gold" />
                          ) : (
                            <Lock className="size-4 shrink-0 text-muted" aria-label="Locked" />
                          )}
                          <span className={open ? "text-ink" : "text-muted"}>{l.title}</span>
                          {l.isPreview && !enrolled ? <Badge tone="gold">Free preview</Badge> : null}
                          <span className="ml-auto flex items-center gap-1 text-xs text-muted">
                            <Clock className="size-3" /> {l.durationMin} min
                          </span>
                        </div>
                      );
                      return (
                        <li key={l.id}>
                          {open ? (
                            <Link href={`/courses/${course.slug}/lessons/${l.id}`} className="block hover:bg-surface-2">
                              {row}
                            </Link>
                          ) : (
                            row
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-12 rounded-2xl border border-line bg-surface p-6">
            <Eyebrow>Your teacher</Eyebrow>
            <p className="font-display mt-2 text-2xl">{course.teacherName}</p>
            <p className="mt-1 text-ink-2">{course.teacherBio}</p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            {enrolled ? (
              <>
                <Badge tone="sage">{enrolled.completedAt ? "Completed" : "Enrolled"}</Badge>
                <p className="mt-4 text-sm text-muted">
                  {done.size} of {lessons.length} lessons complete
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-gold" style={{ width: `${(done.size / Math.max(1, lessons.length)) * 100}%` }} />
                </div>
                {nextLesson ? (
                  <LinkButton href={`/courses/${course.slug}/lessons/${nextLesson.id}`} className="mt-6 w-full">
                    {done.size === 0 ? "Begin the first lesson" : enrolled.completedAt ? "Revisit the course" : "Continue"}
                  </LinkButton>
                ) : null}
              </>
            ) : (
              <>
                <p className="font-display text-4xl">{money(course.priceCents, course.currency)}</p>
                <p className="mt-1 text-sm text-muted">One-time payment · lifetime access</p>
                <ul className="mt-5 space-y-1.5 text-sm text-ink-2">
                  <li>{course.durationLabel}</li>
                  <li>{plural(lessons.length, "lesson")}, each with a practice</li>
                  <li>Ask Sophia about any lesson</li>
                </ul>
                {user ? (
                  <form action={buyCourseAction} className="mt-6">
                    <input type="hidden" name="courseId" value={course.id} />
                    <PendingButton className="w-full" size="lg" pendingLabel="Opening checkout…">
                      Enrol now
                    </PendingButton>
                  </form>
                ) : (
                  <LinkButton href={`/sign-in?next=/courses/${course.slug}`} className="mt-6 w-full" size="lg">
                    Sign in to enrol
                  </LinkButton>
                )}
                {lessons.find((l) => l.isPreview) ? (
                  <LinkButton
                    href={`/courses/${course.slug}/lessons/${lessons.find((l) => l.isPreview)!.id}`}
                    variant="ghost"
                    className="mt-2 w-full"
                  >
                    <Circle className="size-3.5" /> Try a free lesson
                  </LinkButton>
                ) : null}
              </>
            )}
          </Card>
        </aside>
      </Container>
    </>
  );
}
