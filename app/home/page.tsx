import { and, asc, desc, eq, gt, inArray } from "drizzle-orm";
import { ArrowRight, CalendarDays, Leaf, Mic } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LocalTime } from "@/components/community/forms";
import { Presence } from "@/components/guide/presence";
import { Badge, Card, Container, Eyebrow, LinkButton } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { myCourses } from "@/lib/courses";
import { getDb } from "@/lib/db";
import { circleMembers, circles, courses, gatherings, guideConversations, journeys, lessons, posts, users } from "@/lib/db/schema";
import { dateRange, relativeTime } from "@/lib/format";
import { planFor } from "@/lib/membership";
import { PLANS } from "@/lib/plans";
import { myBookings } from "@/lib/retreats";
import { studyArea } from "@/lib/study-areas";

export const metadata = { title: "Your path" };

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Peace to you" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await requireUser("/home");
  const db = getDb();
  const journey = db.select().from(journeys).where(eq(journeys.userId, user.id)).get();
  if (!journey?.onboardedAt) redirect("/onboarding");
  const { welcome } = await searchParams;

  const plan = planFor(user.id);
  const focus = journey.focusAreas ?? [];

  const all = db
    .select({ id: lessons.id, title: lessons.title, practice: lessons.practice, area: courses.studyArea })
    .from(lessons)
    .innerJoin(courses, eq(courses.id, lessons.courseId))
    .orderBy(asc(lessons.id))
    .all();
  const inFocus = all.filter((l) => focus.includes(l.area));
  const pool = inFocus.length ? inFocus : all;
  const todays = pool.length ? pool[Math.floor(Date.now() / 86_400_000) % pool.length] : null;

  const lastConversation = db
    .select()
    .from(guideConversations)
    .where(eq(guideConversations.userId, user.id))
    .orderBy(desc(guideConversations.updatedAt))
    .get();

  const enrolled = myCourses(user.id).slice(0, 3);
  const nextBooking = myBookings(user.id).find((b) => b.booking.status === "confirmed" && b.retreat.endDate >= new Date().toISOString().slice(0, 10));
  const myCircleIds = db.select({ id: circleMembers.circleId }).from(circleMembers).where(eq(circleMembers.userId, user.id)).all().map((r) => r.id);
  const recentPosts = myCircleIds.length
    ? db
        .select({ id: posts.id, body: posts.body, createdAt: posts.createdAt, author: users.name, circle: circles.name, circleSlug: circles.slug })
        .from(posts)
        .innerJoin(users, eq(users.id, posts.authorId))
        .innerJoin(circles, eq(circles.id, posts.circleId))
        .where(and(inArray(posts.circleId, myCircleIds), eq(posts.hidden, false)))
        .orderBy(desc(posts.createdAt))
        .limit(3)
        .all()
    : [];
  const nextGathering = db
    .select()
    .from(gatherings)
    .where(and(gt(gatherings.startsAt, new Date(Date.now() - 60 * 60 * 1000)), eq(gatherings.cancelled, false)))
    .orderBy(asc(gatherings.startsAt))
    .get();

  return (
    <Container className="py-14">
      {welcome ? (
        <div className="animate-fade-up mb-10 rounded-2xl border border-gold/25 bg-gold-soft/60 px-5 py-4 text-[0.95rem] text-ink-2">
          <span className="font-semibold text-ink">Welcome to the school.</span> Sophia now knows your intention. A good first step is
          simply to say hello to her.
        </div>
      ) : null}

      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-fade-up">
          <Eyebrow>{PLANS[plan].name}</Eyebrow>
          <h1 className="font-display mt-4 text-6xl leading-none sm:text-7xl">
            {greeting()}, <em>{user.name.split(" ")[0]}.</em>
          </h1>
        </div>
        {plan === "seeker" ? (
          <Link href="/membership" className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
            Free plan · see what Initiate adds
          </Link>
        ) : null}
      </header>

      <div className="mt-12 grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        {/* Sophia + intention */}
        <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-night p-8 text-[#fbf6ea] shadow-lift sm:p-10">
          <Image src="/edition/sophia.webp" alt="" fill sizes="(max-width: 1024px) 100vw, 60vw" className="-z-10 object-cover opacity-45" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgb(14_21_17/0.92)_30%,rgb(14_21_17/0.55))]" />
          <div className="flex items-start justify-between gap-6">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#e8c88a]">Your intention</p>
            <Presence state="idle" className="-mr-2 -mt-2 w-20 shrink-0" />
          </div>
          <blockquote className="font-display mt-2 max-w-xl text-[2.2rem] italic leading-[1.15]">&ldquo;{journey.intention}&rdquo;</blockquote>
          <div className="mt-5 flex flex-wrap gap-2">
            {focus.map((k) => (
              <span key={k} className="glass rounded-full px-3 py-1 text-xs">
                {studyArea(k).name}
              </span>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <LinkButton href="/guide" variant="light">
              Talk with Sophia <ArrowRight className="size-4" />
            </LinkButton>
            <Link href="/guide?mode=voice" className="glass inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium hover:bg-white/20">
              <Mic className="size-4" /> Speak with her
            </Link>
          </div>
          {lastConversation ? (
            <Link href={`/guide?c=${lastConversation.id}`} className="mt-6 block text-sm text-[#f3ecdc]/70 hover:text-[#fbf6ea]">
              Continue &ldquo;{lastConversation.title}&rdquo; · {relativeTime(lastConversation.updatedAt)}
            </Link>
          ) : null}
        </div>

        {/* Today's practice */}
        <Card className="flex flex-col bg-moss-soft/60 p-8">
          <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-moss">
            <Leaf className="size-4" /> A practice for today
          </p>
          {todays ? (
            <>
              <p className="font-display mt-5 flex-1 text-[1.65rem] leading-[1.25] text-ink">{todays.practice}</p>
              <p className="mt-5 text-xs text-muted">From the lesson &ldquo;{todays.title}&rdquo;</p>
            </>
          ) : (
            <p className="mt-4 text-muted">Practices appear here once courses are published.</p>
          )}
          <Link href="/journal" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-moss">
            Reflect in your journal <ArrowRight className="size-4" />
          </Link>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="p-7">
          <h2 className="font-display text-3xl">Your courses</h2>
          {enrolled.length ? (
            <ul className="mt-6 space-y-5">
              {enrolled.map((c) => (
                <li key={c.id}>
                  <Link href={`/courses/${c.slug}`} className="group block">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-ink group-hover:text-moss">{c.title}</span>
                      <span className="text-xs tabular-nums text-muted">
                        {c.done}/{c.total}
                      </span>
                    </div>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--moss),var(--gold-bright))]" style={{ width: `${c.total ? (c.done / c.total) * 100 : 0}%` }} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">
              You haven&rsquo;t started a course yet. Every course has free preview lessons.{" "}
              <Link href="/courses" className="font-medium text-moss underline-offset-4 hover:underline">
                Browse courses
              </Link>
            </p>
          )}
        </Card>

        <Card className="p-7">
          <h2 className="font-display text-3xl">Retreats</h2>
          {nextBooking ? (
            <Link href={`/bookings/${nextBooking.booking.reference}`} className="mt-5 block rounded-2xl border border-line p-4 transition-colors hover:bg-surface-2">
              <Badge tone="moss">Confirmed</Badge>
              <p className="font-display mt-3 text-2xl leading-tight text-ink">{nextBooking.retreat.title}</p>
              <p className="mt-1 text-sm text-muted">
                {dateRange(nextBooking.retreat.startDate, nextBooking.retreat.endDate)} · {nextBooking.retreat.location}
              </p>
            </Link>
          ) : (
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">
              Small-group retreats in places of deep stillness.{" "}
              <Link href="/retreats" className="font-medium text-moss underline-offset-4 hover:underline">
                See upcoming retreats
              </Link>
            </p>
          )}
        </Card>

        <Card className="p-7">
          <h2 className="font-display text-3xl">Community</h2>
          {nextGathering ? (
            <Link href="/community/gatherings" className="mt-5 flex gap-3 rounded-2xl border border-line p-4 transition-colors hover:bg-surface-2">
              <CalendarDays className="mt-0.5 size-5 shrink-0 text-gold" />
              <span>
                <span className="block font-medium text-ink">{nextGathering.title}</span>
                <span className="block text-xs text-muted">
                  <LocalTime iso={nextGathering.startsAt.toISOString()} />
                </span>
              </span>
            </Link>
          ) : null}
          {recentPosts.length ? (
            <ul className="mt-5 space-y-3.5">
              {recentPosts.map((p) => (
                <li key={p.id} className="text-sm leading-relaxed">
                  <Link href={`/community/circles/${p.circleSlug}#${p.id}`} className="line-clamp-2 text-ink-2 hover:text-ink">
                    <span className="font-medium text-ink">{p.author}</span> in {p.circle}: {p.body}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">
              Join a circle to see members&rsquo; reflections here.{" "}
              <Link href="/community" className="font-medium text-moss underline-offset-4 hover:underline">
                Explore circles
              </Link>
            </p>
          )}
        </Card>
      </div>
    </Container>
  );
}
