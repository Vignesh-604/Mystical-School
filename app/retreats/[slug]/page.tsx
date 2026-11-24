import { Check, MapPin, Minus, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { CoverArt } from "@/components/geometry";
import { availabilityLabel } from "@/components/retreat-card";
import { Badge, Card, Container, Eyebrow, LinkButton } from "@/components/ui";
import { currentUser } from "@/lib/auth/session";
import { dateRange, money, nights } from "@/lib/format";
import { getRetreat } from "@/lib/retreats";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: getRetreat((await params).slug)?.retreat.title ?? "Retreat" };
}

export default async function RetreatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getRetreat(slug);
  if (!data) notFound();
  const { retreat, rooms } = data;
  const user = await currentUser();
  const remaining = rooms.reduce((n, r) => n + r.remaining, 0);
  const capacity = rooms.reduce((n, r) => n + r.capacity, 0);
  const avail = availabilityLabel(remaining, capacity);
  const from = Math.min(...rooms.map((r) => r.priceCents));
  const bookHref = user ? `/retreats/${retreat.slug}/book` : `/sign-in?next=/retreats/${retreat.slug}/book`;

  return (
    <>
      <CoverArt area={retreat.studyArea} seed={retreat.slug} className="border-b border-line">
        <Container className="py-16 sm:py-24">
          <Badge tone={avail.tone}>{avail.label}</Badge>
          <h1 className="font-display mt-4 max-w-3xl text-5xl font-semibold leading-[1.02] text-white sm:text-6xl">{retreat.title}</h1>
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" /> {retreat.location}, {retreat.country}
            </span>
            <span>
              {dateRange(retreat.startDate, retreat.endDate)} · {nights(retreat.startDate, retreat.endDate)} nights
            </span>
          </p>
        </Container>
      </CoverArt>

      <Container className="grid gap-12 py-12 lg:grid-cols-[1fr_22rem]">
        <div>
          <p className="text-xl leading-relaxed text-ink">{retreat.summary}</p>
          <p className="mt-4 text-lg leading-relaxed text-ink-2">{retreat.description}</p>
          <p className="mt-4 text-sm text-muted">Hosted by {retreat.hostName}</p>

          <section className="mt-12">
            <Eyebrow>The days</Eyebrow>
            <ol className="relative mt-5 space-y-6 border-l border-line pl-6">
              {retreat.itinerary.map((d) => (
                <li key={d.day} className="relative">
                  <span className="absolute -left-[1.85rem] top-1.5 size-3 rounded-full border-2 border-gold bg-bg" />
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">{d.day}</p>
                  <p className="font-display mt-1 text-2xl font-semibold">{d.title}</p>
                  <p className="mt-1 text-ink-2">{d.detail}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-12 grid gap-6 sm:grid-cols-2">
            <div>
              <Eyebrow>Included</Eyebrow>
              <ul className="mt-3 space-y-2">
                {retreat.includes.map((i) => (
                  <li key={i} className="flex gap-2 text-ink-2">
                    <Check className="mt-1 size-4 shrink-0 text-sage" /> {i}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Eyebrow>Not included</Eyebrow>
              <ul className="mt-3 space-y-2">
                {retreat.notIncluded.map((i) => (
                  <li key={i} className="flex gap-2 text-ink-2">
                    <Minus className="mt-1 size-4 shrink-0 text-muted" /> {i}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-12">
            <Eyebrow>Rooms</Eyebrow>
            <ul className="mt-4 grid gap-3">
              {rooms.map((room) => {
                const a = availabilityLabel(room.remaining, room.capacity);
                return (
                  <li key={room.id} className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-5 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <p className="font-medium text-ink">{room.name}</p>
                      <p className="text-sm text-muted">{room.description}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                        <Users className="size-3" /> Up to {room.maxGuestsPerBooking} per booking
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-display text-2xl font-semibold">{money(room.priceCents, retreat.currency)}</p>
                      <p className="text-xs text-muted">per guest</p>
                      <Badge tone={a.tone} className="mt-1">
                        {a.label}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="mt-12 rounded-2xl border border-line bg-surface p-6">
            <Eyebrow>Cancellation policy</Eyebrow>
            <p className="mt-2 leading-relaxed text-ink-2">{retreat.cancellationPolicy}</p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <p className="text-sm text-muted">From</p>
            <p className="font-display text-4xl font-semibold">{money(from, retreat.currency)}</p>
            <p className="text-sm text-muted">per guest · {retreat.depositPercent}% deposit to reserve</p>
            {remaining > 0 ? (
              <LinkButton href={bookHref} size="lg" className="mt-6 w-full">
                Reserve your place
              </LinkButton>
            ) : (
              <p className="mt-6 rounded-xl bg-surface-2 px-4 py-3 text-sm text-ink-2">
                This retreat is fully booked. Places sometimes open up; check back.
              </p>
            )}
            <p className="mt-3 text-center text-xs text-muted">Places are held for 30 minutes while you check out.</p>
          </Card>
        </aside>
      </Container>
    </>
  );
}
