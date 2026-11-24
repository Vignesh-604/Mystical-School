import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { Container, Eyebrow } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { dateRange } from "@/lib/format";
import { getRetreat } from "@/lib/retreats";

export const metadata = { title: "Reserve your place" };
export const dynamic = "force-dynamic";

export default async function BookRetreatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireUser(`/retreats/${slug}/book`);
  const data = getRetreat(slug);
  if (!data) notFound();
  const { retreat, rooms } = data;

  return (
    <Container className="max-w-3xl py-12">
      <Link href={`/retreats/${retreat.slug}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> {retreat.title}
      </Link>
      <Eyebrow className="mt-6">
        {retreat.location} · {dateRange(retreat.startDate, retreat.endDate)}
      </Eyebrow>
      <h1 className="font-display mt-2 text-5xl">Reserve your place</h1>
      <div className="mt-10">
        <BookingForm
          slug={retreat.slug}
          rooms={rooms.map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            priceCents: r.priceCents,
            remaining: r.remaining,
            maxGuestsPerBooking: r.maxGuestsPerBooking,
          }))}
          depositPercent={retreat.depositPercent}
          policy={retreat.cancellationPolicy}
        />
      </div>
    </Container>
  );
}
