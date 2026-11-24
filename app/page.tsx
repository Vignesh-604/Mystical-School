import { ArrowRight, BookOpen, MapPin, MessagesSquare, Sparkles } from "lucide-react";
import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { Geometry } from "@/components/geometry";
import { RetreatCard } from "@/components/retreat-card";
import { Container, Eyebrow, LinkButton } from "@/components/ui";
import { currentUser } from "@/lib/auth/session";
import { listCourses } from "@/lib/courses";
import { listRetreats } from "@/lib/retreats";
import { CORE_VALUES } from "@/lib/study-areas";

const DOORWAYS = [
  {
    href: "/guide",
    icon: Sparkles,
    title: "Sophia, your guide",
    body: "An AI guide for your inner life. Talk by text or voice; she remembers your intention and helps you turn insight into practice.",
    cta: "Meet Sophia",
  },
  {
    href: "/courses",
    icon: BookOpen,
    title: "Courses",
    body: "Self-knowledge, meditation, wisdom traditions, sacred geometry and conscious leadership, each lesson ending in a practice.",
    cta: "Browse courses",
  },
  {
    href: "/retreats",
    icon: MapPin,
    title: "Retreats",
    body: "In-person retreats in places of deep stillness, from the Ganges to the cloud forest, with small groups and experienced hosts.",
    cta: "See retreats",
  },
  {
    href: "/community",
    icon: MessagesSquare,
    title: "Community",
    body: "Circles for every subject, live gatherings, and Wisdom in Action projects where members put what they learn to work for others.",
    cta: "Visit the community",
  },
];

const IN_ACTION: [string, string][] = [
  ["Compassion", "Humanitarian initiatives"],
  ["Meditation", "Mental clarity and well-being"],
  ["Universal interconnectedness", "Protecting the environment"],
  ["Ethical principles", "Responsible businesses"],
  ["Spiritual wisdom", "Peace and understanding"],
  ["Self-awareness", "Healthier families"],
  ["Conscious leadership", "Socially responsible organisations"],
];

const RIPPLE = ["Individual", "Family", "Community", "Society"];

export default async function LandingPage() {
  const user = await currentUser();
  const courses = listCourses().slice(0, 3);
  const retreats = listRetreats().slice(0, 2);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Container className="grid items-center gap-12 pb-20 pt-14 lg:grid-cols-[1.1fr_1fr] lg:pb-28 lg:pt-20">
          <div className="animate-fade-up">
            <Eyebrow>A school for the whole human being</Eyebrow>
            <h1 className="font-display mt-5 text-5xl font-semibold leading-[0.98] text-ink sm:text-6xl lg:text-7xl">
              Wisdom,
              <br />
              <span className="italic text-gold">put into practice.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Explore self-knowledge, consciousness, meditation and the world&rsquo;s wisdom traditions. Learn with a
              guide who knows your path and teachers who walk theirs, and live it out in a community that turns insight
              into service.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <LinkButton href={user ? "/home" : "/sign-up"} size="lg">
                {user ? "Continue your path" : "Begin free"}
              </LinkButton>
              <LinkButton href="/guide" variant="secondary" size="lg">
                Meet Sophia
              </LinkButton>
            </div>
            <p className="mt-5 text-sm text-muted">Free to join. No tradition required, and none asked to be left behind.</p>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[520px]" aria-hidden>
            <Geometry motif="flower" className="animate-slow-spin absolute inset-0 text-gold/30" strokeWidth={0.6} />
            <Geometry motif="metatron" className="absolute inset-[16%] text-indigo/25" strokeWidth={0.6} />
            <Geometry motif="seed" className="animate-breathe absolute inset-[30%] text-gold" strokeWidth={1.1} />
          </div>
        </Container>
      </section>

      {/* Four doorways */}
      <section className="border-y border-line bg-surface/60">
        <Container className="py-20">
          <div className="max-w-2xl">
            <Eyebrow>Four doorways</Eyebrow>
            <h2 className="font-display mt-3 text-4xl font-semibold leading-tight">One school, many ways in</h2>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
            {DOORWAYS.map((d) => (
              <Link key={d.href} href={d.href} className="group flex flex-col bg-surface p-7 transition-colors hover:bg-bg">
                <d.icon className="size-6 text-gold" strokeWidth={1.5} />
                <h3 className="font-display mt-5 text-2xl font-semibold text-ink">{d.title}</h3>
                <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-muted">{d.body}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                  {d.cta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Wisdom in action */}
      <section>
        <Container className="grid gap-14 py-24 lg:grid-cols-2">
          <div>
            <Eyebrow>Mystical Wisdom in Action</Eyebrow>
            <h2 className="font-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              Every subject leads somewhere useful.
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
              The school is not measured by how many books its students read or how many hours they meditate, but by how
              positively they transform their lives and the lives of others. So every lesson ends with a practice, and
              every practice points beyond yourself.
            </p>
            <div className="mt-10 flex items-center gap-3" aria-label="When individuals transform, families, communities and society can transform">
              {RIPPLE.map((r, i) => (
                <div key={r} className="flex items-center gap-3">
                  <div className="text-center">
                    <div
                      className="mx-auto rounded-full border border-gold/60"
                      style={{ width: 18 + i * 14, height: 18 + i * 14, opacity: 1 - i * 0.15 }}
                    />
                    <p className="mt-2 text-xs font-medium text-ink-2">{r}</p>
                  </div>
                  {i < RIPPLE.length - 1 ? <ArrowRight className="size-3.5 text-muted" /> : null}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-surface">
            <div className="grid grid-cols-2 border-b border-line px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              <span>Knowledge acquired</span>
              <span>Practical application</span>
            </div>
            <ul>
              {IN_ACTION.map(([k, a]) => (
                <li key={k} className="grid grid-cols-2 items-center gap-4 border-b border-line/70 px-6 py-4 last:border-0">
                  <span className="font-display text-xl text-ink">{k}</span>
                  <span className="flex items-center gap-2 text-[0.95rem] text-ink-2">
                    <ArrowRight className="size-4 shrink-0 text-gold" />
                    {a}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Courses */}
      {courses.length > 0 ? (
        <section className="border-t border-line">
          <Container className="py-20">
            <div className="flex items-end justify-between gap-4">
              <div>
                <Eyebrow>Courses</Eyebrow>
                <h2 className="font-display mt-3 text-4xl font-semibold">Begin with a course</h2>
              </div>
              <Link href="/courses" className="hidden items-center gap-1.5 text-sm font-medium text-ink sm:inline-flex">
                All courses <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* Retreats */}
      {retreats.length > 0 ? (
        <section className="border-t border-line bg-surface/60">
          <Container className="py-20">
            <div className="flex items-end justify-between gap-4">
              <div>
                <Eyebrow>Retreats</Eyebrow>
                <h2 className="font-display mt-3 text-4xl font-semibold">Step away, together</h2>
              </div>
              <Link href="/retreats" className="hidden items-center gap-1.5 text-sm font-medium text-ink sm:inline-flex">
                All retreats <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {retreats.map((r) => (
                <RetreatCard key={r.id} retreat={r} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* Values and closing */}
      <section className="border-t border-line">
        <Container className="py-24 text-center">
          <Geometry motif="seed" className="mx-auto size-14 text-gold" />
          <blockquote className="font-display mx-auto mt-8 max-w-3xl text-3xl italic leading-snug text-ink sm:text-4xl">
            &ldquo;The ultimate achievement of a Mystical School is not the enlightenment of a few individuals, but the
            contribution of its students towards the awakening and betterment of humanity.&rdquo;
          </blockquote>
          <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2">
            {CORE_VALUES.map((v) => (
              <li key={v} className="rounded-full border border-line-strong px-4 py-1.5 text-sm text-ink-2">
                {v}
              </li>
            ))}
          </ul>
          {!user ? (
            <div className="mt-12">
              <LinkButton href="/sign-up" size="lg">
                Begin free
              </LinkButton>
            </div>
          ) : null}
        </Container>
      </section>
    </>
  );
}
