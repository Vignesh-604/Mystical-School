import { eq } from "drizzle-orm";
import { MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { cancelBookingAction, payBalanceAction } from "@/app/actions/retreats";
import { CoverArt } from "@/components/geometry";
import { PendingButton } from "@/components/pending-button";
import { Badge, Card, Container, LinkButton, Notice } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { dateRange, money, shortDate } from "@/lib/format";
import { bookingWithDetails } from "@/lib/retreats";

export const metadata = { title: "Your booking" };
export const dynamic = "force-dynamic";

const STATUS = {
  confirmed: { label: "Confirmed", tone: "sage" },
  held: { label: "Awaiting payment", tone: "gold" },
  cancelled: { label: "Cancelled", tone: "rose" },
  expired: { label: "Hold expired", tone: "neutral" },
} as const;

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const { reference } = await params;
  const { cancelled } = await searchParams;
  const user = await requireUser(`/bookings/${reference}`);
  const row = getDb().select({ id: bookings.id, userId: bookings.userId }).from(bookings).where(eq(bookings.reference, reference)).get();
  if (!row || row.userId !== user.id) notFound();
  const { booking, retreat, room } = bookingWithDetails(row.id)!;
  const balance = booking.totalCents - booking.paidCents;
  const status = STATUS[booking.status];

  return (
    <Container className="max-w-3xl py-12">
      {cancelled ? (
        <Notice tone="gold" className="mb-6" title="Your booking has been cancelled">
          Any refund due under the cancellation policy is handled by the school (test mode: no money moves).
        </Notice>
      ) : null}
      <Card className="overflow-hidden">
        <CoverArt area={retreat.studyArea} seed={retreat.slug} className="h-36" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={status.tone}>{status.label}</Badge>
            <span className="text-sm text-muted">Reference {booking.reference}</span>
          </div>
          <h1 className="font-display mt-3 text-4xl font-semibold">{retreat.title}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-ink-2">
            <MapPin className="size-4 text-gold" /> {retreat.location}, {retreat.country}
          </p>
          <p className="text-muted">{dateRange(retreat.startDate, retreat.endDate)}</p>

          <dl className="mt-8 grid gap-4 border-t border-line pt-6 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Room</dt>
              <dd className="text-ink">{room.name}</dd>
            </div>
            <div>
              <dt className="text-muted">Guests</dt>
              <dd className="text-ink">
                {booking.guests}
                {booking.contact.guestNames?.length ? ` (with ${booking.contact.guestNames.join(", ")})` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Total</dt>
              <dd className="text-ink">{money(booking.totalCents)}</dd>
            </div>
            <div>
              <dt className="text-muted">Paid</dt>
              <dd className="text-ink">
                {money(booking.paidCents)}
                {balance > 0 && booking.status === "confirmed" ? <span className="text-muted"> · {money(balance)} remaining</span> : null}
              </dd>
            </div>
            {booking.confirmedAt ? (
              <div>
                <dt className="text-muted">Booked</dt>
                <dd className="text-ink">{shortDate(booking.confirmedAt)}</dd>
              </div>
            ) : null}
            {booking.contact.dietary ? (
              <div>
                <dt className="text-muted">Dietary</dt>
                <dd className="text-ink">{booking.contact.dietary}</dd>
              </div>
            ) : null}
          </dl>

          {booking.status === "confirmed" ? (
            <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-6">
              {balance > 0 ? (
                <form action={payBalanceAction}>
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <PendingButton pendingLabel="Opening checkout…">Pay remaining {money(balance)}</PendingButton>
                </form>
              ) : null}
              <LinkButton href={`/retreats/${retreat.slug}`} variant="secondary">
                Retreat details
              </LinkButton>
            </div>
          ) : null}
        </div>
      </Card>

      {booking.status === "confirmed" ? (
        <details className="mt-6 rounded-2xl border border-line bg-surface p-6">
          <summary className="cursor-pointer font-medium text-ink">Need to cancel?</summary>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">{retreat.cancellationPolicy}</p>
          <form action={cancelBookingAction} className="mt-4">
            <input type="hidden" name="reference" value={booking.reference} />
            <PendingButton variant="danger" pendingLabel="Cancelling…">
              Cancel this booking
            </PendingButton>
          </form>
        </details>
      ) : null}
    </Container>
  );
}
