import { and, asc, desc, eq, gt, inArray } from "drizzle-orm";
import { ArrowRight, CalendarDays, Leaf } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Geometry } from "@/components/geometry";
import { Badge, Card, Container, Eyebrow, LinkButton } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { myCourses } from "@/lib/courses";
import { getDb } from "@/lib/db";
import { circleMembers, circles, courses, gatherings, guideConversations, journeys, lessons, posts, users } from "@/lib/db/schema";
import { dateRange, dateTime, relativeTime } from "@/lib/format";
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

  // A practice for today, drawn from lessons in the member's focus areas.
  const all = db
    .select({ id: lessons.id, title: lessons.title, practice: lessons.practice, area: courses.studyArea })
    .from(lessons)
    .innerJoin(courses, eq(courses.id, lessons.courseId))
    .orderBy(asc(lessons.id))
    .all();
  const inFocus = all.filter((l) => focus.includes(l.area));
  const pool = inFocus.length ? inFocus : all;
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const todays = pool.length ? pool[dayIndex % pool.length] : null;

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
    <Container className="py-12">
      {welcome ? (
        <div className="animate-fade-up mb-8 rounded-2xl border border-gold/30 bg-gold-soft/40 px-5 py-4 text-sm text-ink-2">
          <span className="font-medium text-ink">Welcome to the school.</span> Sophia now knows your intention. A good first
          step is simply to say hello to her.
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>{PLANS[plan].name}</Eyebrow>
          <h1 className="font-display mt-2 text-4xl font-semibold sm:text-5xl">
            {greeting()}, {user.name.split(" ")[0]}.
          </h1>
        </div>
        {plan === "seeker" ? (
          <Link href="/membership" className="text-sm text-muted hover:text-ink">
            Free plan · see what Initiate adds
          </Link>
        ) : null}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* Sophia */}
        <Card className="relative overflow-hidden p-7 sm:p-9">
          <Geometry motif="seed" className="animate-breathe pointer-events-none absolute -right-10 -top-10 size-64 text-gold/20" strokeWidth={0.8} />
          <p className="text-sm font-medium text-gold">Your intention</p>
          <blockquote className="font-display mt-2 max-w-xl text-2xl italic leading-snug text-ink">
            &ldquo;{journey.intention}&rdquo;
          </blockquote>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {focus.map((k) => (
              <Badge key={k} tone="gold">
                {studyArea(k).name}
              </Badge>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton href="/guide">Talk with Sophia</LinkButton>
            {lastConversation ? (
              <Link href={`/guide?c=${lastConversation.id}`} className="text-sm text-muted hover:text-ink">
                Continue &ldquo;{lastConversation.title}&rdquo; · {relativeTime(lastConversation.updatedAt)}
              </Link>
            ) : (
              <Link href="/account#journey" className="text-sm text-muted hover:text-ink">
                Edit your intention
              </Link>
            )}
          </div>
        </Card>

        {/* Today's practice */}
        <Card className="flex flex-col p-7">
          <div className="flex items-center gap-2 text-sm font-medium text-sage">
            <Leaf className="size-4" /> A practice for today
          </div>
          {todays ? (
            <>
              <p className="mt-3 flex-1 leading-relaxed text-ink-2">{todays.practice}</p>
              <p className="mt-4 text-xs text-muted">From the lesson &ldquo;{todays.title}&rdquo;</p>
            </>
          ) : (
            <p className="mt-3 text-muted">Practices appear here once courses are published.</p>
          )}
          <Link href="/journal" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-ink">
            Reflect in your journal <ArrowRight className="size-4" />
          </Link>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Courses */}
        <Card className="p-6">
          <h2 className="font-display text-2xl font-semibold">Your courses</h2>
          {enrolled.length ? (
            <ul className="mt-4 space-y-4">
              {enrolled.map((c) => (
                <li key={c.id}>
                  <Link href={`/courses/${c.slug}`} className="group block">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-ink group-hover:underline">{c.title}</span>
                      <span className="text-xs text-muted">
                        {c.done}/{c.total}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${c.total ? (c.done / c.total) * 100 : 0}%` }} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">
              You haven&rsquo;t started a course yet. Every course has free preview lessons.{" "}
              <Link href="/courses" className="font-medium text-ink underline decoration-gold/50 underline-offset-4">
                Browse courses
              </Link>
            </p>
          )}
        </Card>

        {/* Retreat */}
        <Card className="p-6">
          <h2 className="font-display text-2xl font-semibold">Retreats</h2>
          {nextBooking ? (
            <Link href={`/bookings/${nextBooking.booking.reference}`} className="mt-4 block rounded-xl border border-line p-4 hover:bg-surface-2">
              <Badge tone="sage">Confirmed</Badge>
              <p className="mt-2 font-medium text-ink">{nextBooking.retreat.title}</p>
              <p className="text-sm text-muted">
                {dateRange(nextBooking.retreat.startDate, nextBooking.retreat.endDate)} · {nextBooking.retreat.location}
              </p>
            </Link>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Small-group retreats in places of deep stillness.{" "}
              <Link href="/retreats" className="font-medium text-ink underline decoration-gold/50 underline-offset-4">
                See upcoming retreats
              </Link>
            </p>
          )}
        </Card>

        {/* Community */}
        <Card className="p-6">
          <h2 className="font-display text-2xl font-semibold">Community</h2>
          {nextGathering ? (
            <Link href="/community/gatherings" className="mt-4 flex gap-3 rounded-xl border border-line p-3 hover:bg-surface-2">
              <CalendarDays className="mt-0.5 size-5 shrink-0 text-gold" />
              <span>
                <span className="block text-sm font-medium text-ink">{nextGathering.title}</span>
                <span className="block text-xs text-muted">{dateTime(nextGathering.startsAt)}</span>
              </span>
            </Link>
          ) : null}
          {recentPosts.length ? (
            <ul className="mt-4 space-y-3">
              {recentPosts.map((p) => (
                <li key={p.id} className="text-sm">
                  <Link href={`/community/circles/${p.circleSlug}#${p.id}`} className="line-clamp-2 text-ink-2 hover:text-ink">
                    <span className="font-medium text-ink">{p.author}</span> in {p.circle}: {p.body}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Join a circle to see members&rsquo; reflections here.{" "}
              <Link href="/community" className="font-medium text-ink underline decoration-gold/50 underline-offset-4">
                Explore circles
              </Link>
            </p>
          )}
        </Card>
      </div>
    </Container>
  );
}
