import { CalendarDays, Clock, ExternalLink, Users, Video } from "lucide-react";
import Link from "next/link";
import { Reveal } from "../motion";
import { cancelGatheringAction, setGatheringLinkAction, toggleRsvpAction } from "@/app/actions/community";
import type { upcomingGatherings } from "@/lib/community";
import { Badge, Button, Input } from "../ui";
import { LocalTime } from "./forms";

type G = ReturnType<typeof upcomingGatherings>[number];

export function GatheringCard({ g, viewerId, compact }: { g: G; viewerId?: string; compact?: boolean }) {
  const now = Date.now();
  const start = g.startsAt.getTime();
  const live = start - 10 * 60_000 <= now && now <= start + g.durationMin * 60_000;
  const isHost = viewerId === g.hostId;
  return (
    <Reveal>
    <article className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-3.5 text-gold" /> <LocalTime iso={g.startsAt.toISOString()} />
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" /> {g.durationMin} min
        </span>
        {live ? <Badge tone="sage">Happening now</Badge> : null}
      </div>
      <h3 className="font-display mt-2 text-2xl leading-tight">{g.title}</h3>
      {!compact ? <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-2">{g.description}</p> : null}
      <p className="mt-2 text-sm text-muted">
        Hosted by {g.hostName}
        {g.project ? (
          <>
            {" "}
            · <Link className="hover:underline" href={`/community/projects/${g.project.slug}`}>{g.project.title}</Link>
          </>
        ) : g.circle ? (
          <>
            {" "}
            · <Link className="hover:underline" href={`/community/circles/${g.circle.slug}`}>{g.circle.name}</Link>
          </>
        ) : null}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {viewerId ? (
          <form action={toggleRsvpAction}>
            <input type="hidden" name="gatheringId" value={g.id} />
            <Button size="sm" variant={g.attending ? "secondary" : "primary"}>
              {g.attending ? "You're going" : "I'll join"}
            </Button>
          </form>
        ) : null}
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <Users className="size-3.5" /> {g.going} going
        </span>
        {g.joinUrl && g.attending ? (
          <a
            href={g.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-sm font-medium text-white hover:bg-gold-ink dark:text-[#1a1408]"
          >
            <Video className="size-3.5" /> {g.provider === "smartmeet" ? "Join on SmartMeet" : "Join"}
            <ExternalLink className="size-3" />
          </a>
        ) : !g.joinUrl ? (
          <span className="ml-auto text-xs text-muted">Room link coming soon</span>
        ) : (
          <span className="ml-auto text-xs text-muted">RSVP to see the link</span>
        )}
      </div>
      {isHost && !compact ? (
        <div className="mt-4 space-y-2 border-t border-line pt-4">
          {!g.joinUrl ? (
            <form action={setGatheringLinkAction} className="flex gap-2">
              <input type="hidden" name="gatheringId" value={g.id} />
              <Input name="link" type="url" placeholder="https://… meeting link" className="h-9 text-sm" aria-label="Meeting link" required />
              <Button size="sm" variant="secondary">
                Add link
              </Button>
            </form>
          ) : null}
          <form action={cancelGatheringAction}>
            <input type="hidden" name="gatheringId" value={g.id} />
            <button className="text-xs text-muted hover:text-rose">Cancel this gathering</button>
          </form>
        </div>
      ) : null}
    </article>
    </Reveal>
  );
}
