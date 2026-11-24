import Link from "next/link";
import { Reveal } from "./motion";
import type { CourseListItem } from "@/lib/courses";
import { money, plural } from "@/lib/format";
import { CoverArt } from "./geometry";
import { Badge } from "./ui";

const LEVEL: Record<string, string> = { foundation: "Foundation", intermediate: "Intermediate", advanced: "Advanced" };

export function CourseCard({ course, enrolled, index = 0 }: { course: CourseListItem; enrolled?: boolean; index?: number }) {
  return (
    <Reveal delay={(index % 3) * 110} className="h-full">
    <Link
      href={`/courses/${course.slug}`}
      className="lift group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-soft"
    >
      <CoverArt area={course.studyArea} seed={course.slug} className="aspect-[4/3]" />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted">
          {LEVEL[course.level]} · {plural(course.lessonCount, "lesson")}
        </p>
        <h3 className="font-display mt-3 text-[2.05rem] leading-[1.02] text-ink">{course.title}</h3>
        <p className="mt-2 text-[0.97rem] leading-relaxed text-muted">{course.subtitle}</p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4 text-sm">
          <span className="text-ink-2">with {course.teacherName}</span>
          {enrolled ? <Badge tone="moss">Enrolled</Badge> : <span className="font-display text-xl text-ink">{money(course.priceCents, course.currency)}</span>}
        </div>
      </div>
    </Link>
    </Reveal>
  );
}
