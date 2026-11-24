import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { Container, EmptyState, PageHeader } from "@/components/ui";
import { currentUser } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import { listCourses, myCourses } from "@/lib/courses";
import { STUDY_AREAS } from "@/lib/study-areas";

export const metadata = { title: "Courses" };

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
  const { area } = await searchParams;
  const user = await currentUser();
  const all = listCourses();
  const enrolled = new Set(user ? myCourses(user.id).map((c) => c.id) : []);
  const areas = STUDY_AREAS.filter((a) => all.some((c) => c.studyArea === a.key));
  const shown = area ? all.filter((c) => c.studyArea === area) : all;

  return (
    <Container className="py-14">
      <PageHeader eyebrow="Courses" title="Learn, practise, contribute">
        Each course moves through teaching, a daily practice and a &ldquo;Wisdom in Action&rdquo; step that turns what you learn into
        something good for others. Every course has free preview lessons.
      </PageHeader>

      <nav aria-label="Filter by subject" className="mt-10 flex flex-wrap gap-2">
        <Link
          href="/courses"
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
            !area ? "border-ink bg-ink text-bg" : "border-line-strong text-ink-2 hover:bg-surface-2",
          )}
        >
          All
        </Link>
        {areas.map((a) => (
          <Link
            key={a.key}
            href={`/courses?area=${a.key}`}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              area === a.key ? "border-ink bg-ink text-bg" : "border-line-strong text-ink-2 hover:bg-surface-2",
            )}
          >
            {a.name}
          </Link>
        ))}
      </nav>

      {shown.length === 0 ? (
        <EmptyState className="mt-10" title="No courses here yet">
          New courses in this subject are being prepared.
        </EmptyState>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => (
            <CourseCard key={c.id} course={c} enrolled={enrolled.has(c.id)} />
          ))}
        </div>
      )}
    </Container>
  );
}
