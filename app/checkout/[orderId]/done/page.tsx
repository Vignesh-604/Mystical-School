import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Geometry } from "@/components/geometry";
import { Container, LinkButton } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { money } from "@/lib/format";
import { getOrderForUser } from "@/lib/payments";
import { bookingWithDetails } from "@/lib/retreats";

export const metadata = { title: "Thank you" };

export default async function CheckoutDonePage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await requireUser();
  const order = getOrderForUser(orderId, user.id);
  if (!order || order.status !== "paid") notFound();

  let title = "Thank you";
  let body = "";
  let cta = { href: "/home", label: "Back to your path" };
  if (order.kind === "course") {
    const course = getDb().select().from(courses).where(eq(courses.id, order.refId)).get();
    title = "You're enrolled";
    body = `${course?.title ?? "Your course"} is now open to you. Take it at your own pace; every lesson ends with a practice.`;
    cta = { href: course ? `/courses/${course.slug}` : "/courses", label: "Begin the course" };
  } else if (order.kind === "retreat") {
    const b = bookingWithDetails(order.refId);
    title = "Your place is confirmed";
    body = b
      ? `${b.retreat.title}, ${b.retreat.location}. Booking reference ${b.booking.reference}. We'll be in touch with travel and preparation notes.`
      : "Your booking is confirmed.";
    cta = { href: b ? `/bookings/${b.booking.reference}` : "/account", label: "View your booking" };
  } else {
    title = "Welcome, Initiate";
    body = "Sophia now remembers your path, voice sessions are longer, and face-to-face sessions are open to you.";
    cta = { href: "/guide", label: "Talk with Sophia" };
  }

  return (
    <Container className="max-w-xl py-20 text-center">
      <Geometry motif="seed" className="animate-breathe mx-auto size-20 text-gold" />
      <h1 className="font-display mt-8 text-5xl">{title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">{body}</p>
      <p className="mt-3 text-sm text-muted">
        Test payment of {money(order.amountCents, order.currency)} recorded · ref {order.providerRef}
      </p>
      <LinkButton href={cta.href} size="lg" className="mt-8">
        {cta.label}
      </LinkButton>
    </Container>
  );
}
