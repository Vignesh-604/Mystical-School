import { GatheringCard } from "@/components/community/gathering-card";
import { Container, EmptyState, LinkButton, Notice, PageHeader } from "@/components/ui";
import { currentUser } from "@/lib/auth/session";
import { upcomingGatherings } from "@/lib/community";
import { capabilities } from "@/lib/env";

export const metadata = { title: "Gatherings" };
export const dynamic = "force-dynamic";

export default async function GatheringsPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const { created } = await searchParams;
  const user = await currentUser();
  const gatherings = upcomingGatherings({ viewerId: user?.id });
  const smartmeet = capabilities().smartmeet;

  return (
    <Container className="max-w-3xl py-14">
      <PageHeader
        eyebrow="Community"
        title="Gatherings"
        actions={<LinkButton href={user ? "/community/gatherings/new" : "/sign-in?next=/community/gatherings/new"}>Host a gathering</LinkButton>}
      >
        Live sessions where members meet, practise and plan together. Times are shown in your own time zone.
      </PageHeader>
      {created ? (
        <Notice tone="sage" className="mt-8">
          Your gathering is scheduled.{" "}
          {created === "smartmeet"
            ? "A SmartMeet room has been created."
            : created === "link"
              ? "Members who RSVP will see your meeting link."
              : "Add a meeting link on its card whenever you're ready."}
        </Notice>
      ) : null}
      <div className="mt-10 space-y-4">
        {gatherings.length ? (
          gatherings.map((g) => <GatheringCard key={g.id} g={g} viewerId={user?.id} />)
        ) : (
          <EmptyState title="Nothing scheduled yet">Host the first gathering: a shared sit, a study evening, or a project planning call.</EmptyState>
        )}
      </div>
      {!smartmeet ? (
        <p className="mt-10 text-xs text-muted">
          SmartMeet rooms are not switched on in this local build, so hosts add their own meeting link. See README for how to turn the
          integration on.
        </p>
      ) : null}
    </Container>
  );
}
