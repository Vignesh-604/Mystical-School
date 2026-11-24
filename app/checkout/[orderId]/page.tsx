import { ShieldCheck } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { cancelCheckoutAction } from "@/app/actions/checkout";
import { CheckoutForm } from "@/components/checkout-form";
import { Card, Container, Notice } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { dateRange, money } from "@/lib/format";
import { getOrderForUser } from "@/lib/payments";
import { bookingWithDetails } from "@/lib/retreats";
import { eq } from "drizzle-orm";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await requireUser(`/checkout/${orderId}`);
  const order = getOrderForUser(orderId, user.id);
  if (!order) notFound();
  if (order.status === "paid") redirect(`/checkout/${order.id}/done`);

  let back = "/";
  let detail: React.ReactNode = null;
  if (order.kind === "course") {
    const course = getDb().select().from(courses).where(eq(courses.id, order.refId)).get();
    back = course ? `/courses/${course.slug}` : "/courses";
    detail = course ? <p className="text-sm text-muted">{course.subtitle}</p> : null;
  } else if (order.kind === "retreat") {
    const b = bookingWithDetails(order.refId);
    back = b ? `/retreats/${b.retreat.slug}` : "/retreats";
    if (b) {
      const minutesLeft = b.booking.holdExpiresAt ? Math.max(0, Math.round((b.booking.holdExpiresAt.getTime() - Date.now()) / 60000)) : 0;
      detail = (
        <div className="space-y-1 text-sm text-muted">
          <p>
            {b.room.name} · {b.booking.guests} {b.booking.guests === 1 ? "guest" : "guests"} · {dateRange(b.retreat.startDate, b.retreat.endDate)}
          </p>
          <p>
            {b.booking.paymentPlan === "deposit" && b.booking.status === "held"
              ? `Deposit now; ${money(b.booking.totalCents - order.amountCents)} balance due before the retreat. Total ${money(b.booking.totalCents)}.`
              : b.booking.status === "confirmed"
                ? `Remaining balance for booking ${b.booking.reference}.`
                : `Paid in full. Total ${money(b.booking.totalCents)}.`}
          </p>
          {b.booking.status === "held" ? (
            <p className="text-gold-ink">Your places are held for {minutesLeft} more minutes.</p>
          ) : null}
        </div>
      );
    }
  } else {
    back = "/membership";
  }

  if (order.status !== "pending") {
    return (
      <Container className="max-w-xl py-16">
        <Notice tone="gold" title="This checkout is closed">
          The order was {order.status}. Nothing was charged.
        </Notice>
      </Container>
    );
  }

  return (
    <Container className="max-w-xl py-16">
      <h1 className="font-display text-4xl">Checkout</h1>
      <Notice tone="gold" className="mt-6" title="Test mode: no real payment">
        This local build uses a simulated payment provider. Completing checkout records a test payment; no card is asked for and no
        money moves.
      </Notice>
      <Card className="mt-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-ink">{order.description}</p>
            <div className="mt-1">{detail}</div>
          </div>
          <p className="font-display text-2xl">{money(order.amountCents, order.currency)}</p>
        </div>
        <div className="mt-6 border-t border-line pt-6">
          <CheckoutForm orderId={order.id} amountLabel={money(order.amountCents, order.currency)} />
          <form action={cancelCheckoutAction} className="mt-3 text-center">
            <input type="hidden" name="orderId" value={order.id} />
            <input type="hidden" name="back" value={back} />
            <button className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">Cancel and go back</button>
          </form>
        </div>
      </Card>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
        <ShieldCheck className="size-3.5" /> A real provider (such as Stripe) would take card details on its own secure page.
      </p>
    </Container>
  );
}
