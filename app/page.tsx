import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { Presence } from "@/components/guide/presence";
import { LogoMark } from "@/components/logo";
import { HeroStage, Reveal, Tilt } from "@/components/motion";
import { RetreatCard } from "@/components/retreat-card";
import { buttonClass, Container, Eyebrow, LinkButton, type PhotoKey } from "@/components/ui";
import { currentUser } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import { listCourses } from "@/lib/courses";
import { listRetreats } from "@/lib/retreats";
import { CORE_VALUES, STUDY_AREAS } from "@/lib/study-areas";

const DOORWAYS: { href: string; photo: PhotoKey; kicker: string; title: string; body: string; className: string }[] = [
  {
    href: "/guide",
    photo: "sophia",
    kicker: "Your guide",
    title: "Sophia",
    body: "An AI companion for the inner life. Talk by text or voice; she remembers your intention and turns insight into a practice for today.",
    className: "lg:col-span-7 lg:row-span-2 min-h-[24rem] lg:min-h-[36rem]",
  },
  {
    href: "/courses",
    photo: "hero",
    kicker: "Study",
    title: "Courses",
    body: "Self-knowledge, meditation, wisdom traditions, sacred geometry, conscious leadership.",
    className: "lg:col-span-5 min-h-[17rem]",
  },
  {
    href: "/retreats",
    photo: "retreat",
    kicker: "Step away",
    title: "Retreats",
    body: "Small groups in places of deep stillness, from the Ganges to the cloud forest.",
    className: "lg:col-span-5 min-h-[17rem]",
  },
  {
    href: "/community",
    photo: "community",
    kicker: "Together",
    title: "Community",
    body: "Circles for every subject, live gatherings, and Wisdom in Action projects where members put what they learn to work for others.",
    className: "lg:col-span-12 min-h-[20rem]",
  },
];

const IN_ACTION: [string, string][] = [
  ["Compassion", "Humanitarian initiatives"],
  ["Meditation", "Mental clarity and well-being"],
  ["Interconnectedness", "Protecting the environment"],
  ["Ethical principles", "Responsible businesses"],
  ["Spiritual wisdom", "Peace and understanding"],
  ["Self-awareness", "Healthier families"],
  ["Conscious leadership", "Socially responsible organisations"],
];

function Ripple() {
  const rings = [
    { r: 22, label: "Individual" },
    { r: 58, label: "Family" },
    { r: 96, label: "Community" },
    { r: 136, label: "Society" },
  ];
  return (
    <svg viewBox="-150 -150 300 300" className="w-full max-w-sm" role="img" aria-label="When individuals transform, families, communities and society can transform">
      {[0, 2, 4].map((delay) => (
        <circle key={delay} r={140} fill="none" stroke="var(--gold-bright)" strokeWidth={1.2} className="ripple-pulse" style={{ animationDelay: `${delay}s` }} />
      ))}
      {rings.map((ring, i) => (
        <circle key={ring.label} r={ring.r} fill="none" stroke="var(--moss)" strokeOpacity={0.55 - i * 0.1} strokeWidth={1} strokeDasharray={i === 0 ? undefined : "2 4"} />
      ))}
      <circle r={16} fill="var(--gold-bright)" opacity={0.18} className="animate-breathe" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
      <circle r={7} fill="var(--gold-bright)" />
      {rings.map((ring, i) => (
        <g key={ring.label} transform={`translate(${(ring.r * Math.cos(-0.72 + i * 0.12)).toFixed(1)}, ${(ring.r * Math.sin(-0.72 + i * 0.12)).toFixed(1)})`}>
          <circle r={3} fill="var(--bg)" stroke="var(--gold)" strokeWidth={1.2} />
          <text x={8} y={4} fontSize={11} fill="var(--ink-2)" fontFamily="var(--font-sans)" letterSpacing="0.06em">
            {ring.label.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ValuesBand() {
  const words = [...CORE_VALUES, ...STUDY_AREAS.map((a) => a.name)];
  const track = (hidden?: boolean) => (
    <ul className="marquee__track" aria-hidden={hidden}>
      {words.map((w) => (
        <li key={w} className="flex items-center gap-12 whitespace-nowrap">
          <span className="font-display text-[2.4rem] italic text-ink/80 sm:text-5xl">{w}</span>
          <LogoMark animate={false} className="size-6 text-moss/40" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee border-y border-line py-8" aria-label="The school's values and subjects">
      {track()}
      {track(true)}
    </div>
  );
}

export default async function LandingPage() {
  const user = await currentUser();
  const courses = listCourses().slice(0, 3);
  const retreats = listRetreats().slice(0, 2);

  return (
    <>
      {/* Hero */}
      <section className="px-2.5 pt-2.5 sm:px-4 sm:pt-4">
        <HeroStage
          className="mx-auto flex min-h-[36rem] max-w-[96rem] items-end rounded-[1.75rem] bg-night sm:rounded-[2.25rem] lg:h-[min(86vh,56rem)]"
          image={<Image src="/edition/courses.webp" alt="" fill priority sizes="100vw" className="object-cover object-[50%_60%]" />}
          overlay={
            <>
              <div aria-hidden className="photo-veil-left absolute inset-0 -z-10" />
              <div aria-hidden className="photo-veil absolute inset-0 -z-10 opacity-80" />
            </>
          }
        >
          <div className="px-6 pb-10 pt-28 sm:px-12 sm:pb-14 lg:px-16 lg:pb-16">
            <div className="max-w-3xl">
              <p className="kicker animate-fade-up !text-[#e8c88a]">A school for the inner life</p>
              <h1 className="font-display mt-6 text-[3.3rem] leading-[0.92] text-[#fbf6ea] min-[420px]:text-[3.9rem] sm:text-[5.5rem] lg:text-[7.25rem]">
                <span className="line-mask">
                  <span style={{ ["--delay" as string]: "150ms" }}>Wisdom,</span>
                </span>
                <span className="line-mask">
                  <span style={{ ["--delay" as string]: "320ms" }}>
                    <em className="text-[#e8c88a]">put into practice.</em>
                  </span>
                </span>
              </h1>
              <p className="animate-fade-up delay-3 mt-7 max-w-xl text-[1.05rem] leading-relaxed text-[#f3ecdc]/85 sm:text-lg" style={{ animationDelay: "0.6s" }}>
                Explore self-knowledge, meditation and the world&rsquo;s wisdom traditions with a guide who knows your path, teachers who
                walk theirs, and a community that turns insight into service.
              </p>
              <div className="animate-fade-up mt-9 flex flex-wrap gap-3" style={{ animationDelay: "0.75s" }}>
                <LinkButton href={user ? "/home" : "/sign-up"} variant="light" size="lg">
                  {user ? "Continue your path" : "Begin free"} <ArrowRight className="size-4" />
                </LinkButton>
                <Link href="/guide" className={buttonClass("ghost", "lg", "glass text-[#fbf6ea] hover:bg-white/20 hover:text-white")}>
                  Meet Sophia
                </Link>
              </div>
            </div>
          </div>

          <Link
            href="/guide"
            className="glass animate-fade-up absolute bottom-10 right-10 hidden w-72 items-center gap-4 rounded-3xl p-4 text-[#fbf6ea] transition-colors hover:bg-white/20 xl:flex"
            style={{ animationDelay: "1s" }}
          >
            <Presence state="idle" className="w-16 shrink-0" />
            <span>
              <span className="block font-display text-2xl leading-tight">Sophia is here</span>
              <span className="block text-sm text-[#f3ecdc]/75">Talk by text or voice, any hour.</span>
            </span>
          </Link>
        </HeroStage>
      </section>

      {/* Opening statement */}
      <section>
        <Container className="py-24 text-center sm:py-36">
          <Reveal variant="scale">
            <LogoMark className="mx-auto size-14 text-moss" />
          </Reveal>
          <Reveal delay={120}>
            <p className="font-display mx-auto mt-10 max-w-4xl text-[2rem] leading-[1.18] text-ink sm:text-[3.2rem]">
              Not a school that teaches you what to know, but one that helps you discover <em>who you truly are</em>, why you are
              here, and what you can give.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <p className="mt-8 text-xs uppercase tracking-[0.26em] text-muted sm:text-sm">Mind · Body · Heart · Spirit · Consciousness</p>
          </Reveal>
        </Container>
      </section>

      <ValuesBand />

      {/* Four doorways */}
      <section className="mt-24 sm:mt-32">
        <Container>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <Reveal>
              <Eyebrow>Four doorways</Eyebrow>
              <h2 className="font-display mt-4 text-[2.8rem] leading-[1.02] sm:text-6xl">
                One school, <em>many ways in.</em>
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="max-w-sm text-muted">Begin anywhere. Every path through the school ends in the same place: a life lived a little more wisely.</p>
            </Reveal>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-12">
            {DOORWAYS.map((d, i) => (
              <Reveal key={d.href} delay={(i % 2) * 120} variant="scale" className={cn("flex", d.className)}>
                <Tilt className="flex w-full rounded-[1.6rem]" max={4}>
                  <Link href={d.href} className="group relative isolate flex w-full items-end overflow-hidden rounded-[1.6rem] bg-night shadow-soft">
                    <Image
                      src={`/edition/${d.photo}.webp`}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="-z-10 object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.07]"
                    />
                    <div aria-hidden className="photo-veil absolute inset-0 -z-10" />
                    <span className="glass absolute right-5 top-5 inline-flex size-11 items-center justify-center rounded-full text-white transition-transform duration-500 group-hover:rotate-45">
                      <ArrowUpRight className="size-5" />
                    </span>
                    <div className="max-w-xl p-7 transition-transform duration-500 group-hover:-translate-y-1 sm:p-9">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#e8c88a]">{d.kicker}</p>
                      <h3 className="font-display mt-2 text-5xl text-[#fbf6ea]">{d.title}</h3>
                      <p className="mt-3 text-[0.98rem] leading-relaxed text-[#f3ecdc]/80">{d.body}</p>
                    </div>
                  </Link>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Wisdom in action */}
      <section className="mt-28 sm:mt-36">
        <Container className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] [&>*]:min-w-0">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <Eyebrow>Mystical Wisdom in Action</Eyebrow>
              <h2 className="font-display mt-4 text-[2.8rem] leading-[1.02] sm:text-6xl">
                Every subject <em>leads somewhere useful.</em>
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
                The school isn&rsquo;t measured by the books its students read or the hours they meditate, but by how their lives, and
                the lives around them, change. So every lesson ends in a practice, and every practice points beyond yourself.
              </p>
            </Reveal>
            <Reveal delay={150} variant="scale" className="mt-10 rounded-[1.6rem] border border-line bg-surface/70 p-6">
              <Ripple />
              <p className="mt-2 text-sm text-muted">When individuals transform, families can. When families do, communities and society follow.</p>
            </Reveal>
          </div>
          <div>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-x-4 border-b border-line-strong pb-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted">
              <span>What you learn</span>
              <span />
              <span>What it becomes</span>
            </div>
            <ul>
              {IN_ACTION.map(([k, a], i) => (
                <Reveal as="li" key={k} delay={i * 70} variant="left" className="group grid grid-cols-[1fr_auto_1fr] items-center gap-x-4 border-b border-line py-7">
                  <span className="font-display min-w-0 text-[1.7rem] leading-tight text-ink transition-colors group-hover:text-moss sm:text-4xl">
                    <span className="mr-3 align-top font-sans text-xs text-gold">0{i + 1}</span>
                    {k}
                  </span>
                  <ArrowRight className="size-5 text-gold transition-transform duration-300 group-hover:translate-x-1.5" />
                  <span className="min-w-0 text-[0.95rem] text-ink-2 sm:text-[1.02rem]">{a}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Courses */}
      {courses.length > 0 ? (
        <section className="mt-28 sm:mt-36">
          <Container>
            <Reveal className="flex items-end justify-between gap-4">
              <div>
                <Eyebrow>The course library</Eyebrow>
                <h2 className="font-display mt-4 text-[2.8rem] sm:text-6xl">
                  Begin with <em>a course.</em>
                </h2>
              </div>
              <Link href="/courses" className="hidden items-center gap-2 text-sm font-medium text-ink hover:text-moss sm:inline-flex">
                All courses <ArrowRight className="size-4" />
              </Link>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {courses.map((c, i) => (
                <CourseCard key={c.id} index={i} course={c} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* Retreats */}
      {retreats.length > 0 ? (
        <section className="mt-28 sm:mt-36">
          <Container>
            <Reveal className="flex items-end justify-between gap-4">
              <div>
                <Eyebrow>In-person retreats</Eyebrow>
                <h2 className="font-display mt-4 text-[2.8rem] sm:text-6xl">
                  Step away, <em>together.</em>
                </h2>
              </div>
              <Link href="/retreats" className="hidden items-center gap-2 text-sm font-medium text-ink hover:text-moss sm:inline-flex">
                All retreats <ArrowRight className="size-4" />
              </Link>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {retreats.map((r, i) => (
                <RetreatCard key={r.id} index={i} retreat={r} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* Closing */}
      {!user ? (
        <section className="mt-28 sm:mt-36">
          <Container>
            <Reveal variant="scale" className="relative overflow-hidden rounded-[2rem] border border-line bg-surface px-6 py-20 text-center shadow-soft">
              <Presence state="idle" className="mx-auto w-28" />
              <h2 className="font-display mt-8 text-[2.8rem] sm:text-6xl">
                Begin <em>where you are.</em>
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-lg text-muted">Free to join. No tradition required, and none asked to be left behind.</p>
              <LinkButton href="/sign-up" size="lg" className="mt-9">
                Begin free <ArrowRight className="size-4" />
              </LinkButton>
            </Reveal>
          </Container>
        </section>
      ) : null}
    </>
  );
}
