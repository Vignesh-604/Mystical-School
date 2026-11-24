import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toggleCircleAction } from "@/app/actions/community";
import { PostComposer } from "@/components/community/forms";
import { GatheringCard } from "@/components/community/gathering-card";
import { PostCard } from "@/components/community/post-card";
import { Geometry } from "@/components/geometry";
import { PendingButton } from "@/components/pending-button";
import { Container, EmptyState, Eyebrow, LinkButton } from "@/components/ui";
import { currentUser } from "@/lib/auth/session";
import { feed, getCircle, isCircleMember, listCircles, upcomingGatherings } from "@/lib/community";
import { studyArea } from "@/lib/study-areas";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: getCircle((await params).slug)?.name ?? "Circle" };
}

export default async function CirclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const circle = getCircle(slug);
  if (!circle) notFound();
  const user = await currentUser();
  const member = user ? isCircleMember(circle.id, user.id) : false;
  const posts = feed({ circleId: circle.id, viewerId: user?.id, limit: 50 });
  const stats = listCircles().find((c) => c.id === circle.id);
  const gatherings = upcomingGatherings({ circleId: circle.id, viewerId: user?.id, limit: 3 });
  const area = studyArea(circle.studyArea ?? "wisdom-in-action");

  return (
    <Container className="max-w-3xl py-12">
      <Link href="/community" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Community
      </Link>
      <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
        <Geometry motif={area.motif} className="size-16 shrink-0 text-gold" />
        <div className="flex-1">
          <Eyebrow>Circle · {stats?.members ?? 0} members</Eyebrow>
          <h1 className="font-display mt-1 text-4xl">{circle.name}</h1>
          <p className="mt-1 text-muted">{circle.description}</p>
        </div>
        {user ? (
          <form action={toggleCircleAction}>
            <input type="hidden" name="circleId" value={circle.id} />
            <PendingButton variant={member ? "secondary" : "primary"} pendingLabel="…">
              {member ? "Leave circle" : "Join circle"}
            </PendingButton>
          </form>
        ) : (
          <LinkButton href={`/sign-in?next=/community/circles/${circle.slug}`}>Sign in to join</LinkButton>
        )}
      </header>

      {gatherings.length ? (
        <div className="mt-8 space-y-3">
          {gatherings.map((g) => (
            <GatheringCard key={g.id} g={g} viewerId={user?.id} compact />
          ))}
        </div>
      ) : null}

      <div className="mt-8">{user ? <PostComposer circleId={circle.id} circleName={circle.name} /> : null}</div>

      <div className="mt-6 space-y-4">
        {posts.length ? (
          posts.map((p) => <PostCard key={p.id} post={p} viewerId={user?.id} />)
        ) : (
          <EmptyState title="No posts yet">Start the conversation. What brought you to this circle?</EmptyState>
        )}
      </div>
    </Container>
  );
}
