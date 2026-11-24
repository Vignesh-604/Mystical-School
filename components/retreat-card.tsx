import { MapPin } from "lucide-react";
import Link from "next/link";
import { dateRange, money, nights } from "@/lib/format";
import type { RetreatListItem } from "@/lib/retreats";
import { CoverArt } from "./geometry";
import { Badge } from "./ui";

export function availabilityLabel(remaining: number, capacity: number) {
  if (remaining <= 0) return { label: "Fully booked", tone: "rose" as const };
  if (remaining <= Math.max(3, Math.round(capacity * 0.2))) return { label: `${remaining} places left`, tone: "gold" as const };
  return { label: "Places available", tone: "sage" as const };
}

export function RetreatCard({ retreat }: { retreat: RetreatListItem }) {
  const avail = availabilityLabel(retreat.remaining, retreat.capacity);
  return (
    <Link
      href={`/retreats/${retreat.slug}`}
      className="group grid overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition-transform hover:-translate-y-0.5 sm:grid-cols-[0.9fr_1.1fr]"
    >
      <CoverArt area={retreat.studyArea} seed={retreat.slug} className="aspect-[16/10] sm:aspect-auto sm:min-h-64">
        <div className="flex h-full flex-col justify-end p-5">
          <p className="font-display text-3xl font-semibold leading-none text-white/95">{retreat.country}</p>
        </div>
      </CoverArt>
      <div className="flex flex-col p-6">
        <div className="flex items-center gap-2">
          <Badge tone={avail.tone}>{avail.label}</Badge>
        </div>
        <h3 className="font-display mt-3 text-[1.75rem] font-semibold leading-tight text-ink">{retreat.title}</h3>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{retreat.summary}</p>
        <div className="mt-auto space-y-1 pt-5 text-sm">
          <p className="flex items-center gap-1.5 text-ink-2">
            <MapPin className="size-4 text-gold" />
            {retreat.location}
          </p>
          <p className="text-muted">
            {dateRange(retreat.startDate, retreat.endDate)} · {nights(retreat.startDate, retreat.endDate)} nights
          </p>
          <p className="pt-1 font-medium text-ink">From {money(retreat.fromCents, retreat.currency)}</p>
        </div>
      </div>
    </Link>
  );
}
