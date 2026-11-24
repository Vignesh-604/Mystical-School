import { MapPin } from "lucide-react";
import Link from "next/link";
import { Reveal } from "./motion";
import { dateRange, money, nights } from "@/lib/format";
import type { RetreatListItem } from "@/lib/retreats";
import { CoverArt, retreatPhoto } from "./geometry";

export function availabilityLabel(remaining: number, capacity: number) {
  if (remaining <= 0) return { label: "Fully booked", tone: "rose" as const };
  if (remaining <= Math.max(3, Math.round(capacity * 0.2))) return { label: `${remaining} places left`, tone: "gold" as const };
  return { label: "Places available", tone: "sage" as const };
}

export function RetreatCard({ retreat, index = 0 }: { retreat: RetreatListItem; index?: number }) {
  const avail = availabilityLabel(retreat.remaining, retreat.capacity);
  return (
    <Reveal delay={(index % 2) * 130} variant="scale">
    <Link href={`/retreats/${retreat.slug}`} className="lift group block overflow-hidden rounded-[1.6rem] shadow-soft">
      <CoverArt area={retreat.studyArea} seed={retreat.slug} photo={retreatPhoto(retreat.slug)} label={false} className="aspect-[4/5] sm:aspect-[5/4]">
        <div className="flex h-full flex-col justify-between p-6 text-[#fbf6ea] sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <span className="glass rounded-full px-3 py-1 text-xs font-medium">{avail.label}</span>
            <span className="glass rounded-full px-3 py-1 text-xs font-medium">From {money(retreat.fromCents, retreat.currency)}</span>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#e8c88a]">
              <MapPin className="size-3.5" /> {retreat.location}, {retreat.country}
            </p>
            <h3 className="font-display mt-3 text-[2.4rem] leading-[1.02] sm:text-5xl">{retreat.title}</h3>
            <p className="mt-3 max-w-md text-[0.97rem] leading-relaxed text-[#f3ecdc]/80">{retreat.summary}</p>
            <p className="mt-4 text-sm text-[#f3ecdc]/75">
              {dateRange(retreat.startDate, retreat.endDate)} · {nights(retreat.startDate, retreat.endDate)} nights
            </p>
          </div>
        </div>
      </CoverArt>
    </Link>
    </Reveal>
  );
}
