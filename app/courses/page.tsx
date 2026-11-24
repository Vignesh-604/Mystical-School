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

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-2 text-sm transition-colors",
      active ? "border-moss bg-moss text-bg dark:text-night" : "border-line-strong bg-surface/60 text-ink-2 hover:border-ink/30 hover:text-ink",
    );

  return (
    <Container className="py-16">
      <PageHeader eyebrow="The course library" title={<>Learn, practise, <em>contribute.</em></>} photo="hero">
        Each course moves through teaching, a daily practice and a Wisdom in Action step that turns what you learn into something
        good for others. Every course has free preview lessons.
      </PageHeader>

      <nav aria-label="Filter by subject" className="mt-16 flex flex-wrap gap-2">
        <Link href="/courses" className={chip(!area)}>
          All subjects
        </Link>
        {areas.map((a) => (
          <Link key={a.key} href={`/courses?area=${a.key}`} className={chip(area === a.key)}>
            {a.name}
          </Link>
        ))}
      </nav>

      {shown.length === 0 ? (
        <EmptyState className="mt-10" title="No courses here yet">
          New courses in this subject are being prepared.
        </EmptyState>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c, i) => (
            <CourseCard key={c.id} index={i} course={c} enrolled={enrolled.has(c.id)} />
          ))}
        </div>
      )}
    </Container>
  );
}
