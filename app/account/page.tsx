import { eq } from "drizzle-orm";
import Link from "next/link";
import { clearGuideHistoryAction } from "@/app/actions/account";
import { cancelMembershipAction, resumeMembershipAction } from "@/app/actions/checkout";
import { DeleteAccountForm, ProfileForm } from "@/components/account-forms";
import { JourneyForm } from "@/components/journey-form";
import { PendingButton } from "@/components/pending-button";
import { Badge, Card, Container, LinkButton, Notice, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { journeys } from "@/lib/db/schema";
import { dateRange, money, shortDate } from "@/lib/format";
import { activeSubscription, chatAllowance, voiceAllowance } from "@/lib/membership";
import { myOrders } from "@/lib/payments";
import { myBookings } from "@/lib/retreats";

export const metadata = { title: "Account" };
export const dynamic = "force-dynamic";

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-3xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser("/account");
  const { saved } = await searchParams;
  const journey = getDb().select().from(journeys).where(eq(journeys.userId, user.id)).get();
  const sub = activeSubscription(user.id);
  const orders = myOrders(user.id);
  const bookings = myBookings(user.id);
  const chat = chatAllowance(user.id);
  const voice = voiceAllowance(user.id);

  return (
    <Container className="max-w-3xl space-y-14 py-14">
      <PageHeader eyebrow={user.email} title="Your account" />
      {saved === "journey" ? <Notice tone="sage">Your intention and focus areas are updated. Sophia will use them from now on.</Notice> : null}
      {saved === "history" ? <Notice tone="sage">Your conversations with Sophia and her notes have been deleted.</Notice> : null}
      {saved === "membership" ? <Notice tone="sage">Your membership will end at the close of the current period.</Notice> : null}

      <Section title="Membership">
        <Card className="p-6">
          {sub ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Badge tone="gold">Initiate</Badge>
                <p className="mt-2 text-sm text-ink-2">
                  {sub.cancelAtPeriodEnd ? "Ends" : "Renews"} on {shortDate(sub.currentPeriodEnd)} · billed {sub.interval === "year" ? "yearly" : "monthly"}
                </p>
              </div>
              <form action={sub.cancelAtPeriodEnd ? resumeMembershipAction : cancelMembershipAction}>
                <PendingButton variant="secondary" size="sm" pendingLabel="Saving…">
                  {sub.cancelAtPeriodEnd ? "Keep my membership" : "Cancel membership"}
                </PendingButton>
              </form>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Badge>Seeker (free)</Badge>
                <p className="mt-2 text-sm text-ink-2">
                  {chat.remaining} of {chat.limit} messages and {Math.floor(voice.remaining / 60)} voice minutes left in the last 24 hours.
                </p>
              </div>
              <LinkButton href="/membership" variant="secondary" size="sm">
                Compare plans
              </LinkButton>
            </div>
          )}
        </Card>
      </Section>

      <Section title="Profile">
        <ProfileForm name={user.name} location={user.location} bio={user.bio} />
      </Section>

      <Section id="journey" title="Your intention">
        <JourneyForm initial={journey ?? undefined} returnTo="account" submitLabel="Save my intention" />
      </Section>

      <Section title="Retreat bookings">
        {bookings.length ? (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {bookings.map(({ booking, retreat }) => (
              <li key={booking.id}>
                <Link href={`/bookings/${booking.reference}`} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-surface-2">
                  <span>
                    <span className="block font-medium text-ink">{retreat.title}</span>
                    <span className="block text-sm text-muted">
                      {dateRange(retreat.startDate, retreat.endDate)} · {booking.reference}
                    </span>
                  </span>
                  <Badge tone={booking.status === "confirmed" ? "sage" : booking.status === "held" ? "gold" : "neutral"}>{booking.status}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">
            No bookings yet. <Link href="/retreats" className="underline underline-offset-4">See retreats</Link>
          </p>
        )}
      </Section>

      <Section title="Payments">
        {orders.length ? (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface text-sm">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <span>
                  <span className="block text-ink">{o.description}</span>
                  <span className="block text-xs text-muted">
                    {shortDate(o.paidAt ?? o.createdAt)} · test payment {o.providerRef}
                  </span>
                </span>
                <span className="font-medium text-ink">{money(o.amountCents, o.currency)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No payments yet.</p>
        )}
      </Section>

      <Section title="Privacy and data">
        <div className="space-y-6">
          <Card className="p-6">
            <p className="font-medium text-ink">Delete my conversations with Sophia</p>
            <p className="mt-1 text-sm text-muted">Removes every conversation and transcript, and Sophia&rsquo;s private notes on your journey.</p>
            <form action={clearGuideHistoryAction} className="mt-4">
              <PendingButton variant="danger" size="sm" pendingLabel="Deleting…">
                Delete conversations
              </PendingButton>
            </form>
          </Card>
          <Card className="p-6">
            <p className="font-medium text-ink">Delete my account</p>
            <div className="mt-3">
              <DeleteAccountForm />
            </div>
          </Card>
        </div>
      </Section>
    </Container>
  );
}
