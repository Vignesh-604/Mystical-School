import Link from "next/link";
import type { CourseListItem } from "@/lib/courses";
import { money, plural } from "@/lib/format";
import { studyArea } from "@/lib/study-areas";
import { CoverArt } from "./geometry";
import { Badge } from "./ui";

const LEVEL: Record<string, string> = { foundation: "Foundation", intermediate: "Intermediate", advanced: "Advanced" };

export function CourseCard({ course, enrolled }: { course: CourseListItem; enrolled?: boolean }) {
  const area = studyArea(course.studyArea);
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition-transform hover:-translate-y-0.5"
    >
      <CoverArt area={course.studyArea} seed={course.slug} className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-gold">{area.name}</p>
        <h3 className="font-display mt-2 text-[1.7rem] font-semibold leading-tight text-ink">{course.title}</h3>
        <p className="mt-1 text-[0.95rem] text-muted">{course.subtitle}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
          <span className="text-muted">
            {LEVEL[course.level]} · {plural(course.lessonCount, "lesson")}
          </span>
          {enrolled ? <Badge tone="sage">Enrolled</Badge> : <span className="font-medium text-ink">{money(course.priceCents, course.currency)}</span>}
        </div>
      </div>
    </Link>
  );
}
