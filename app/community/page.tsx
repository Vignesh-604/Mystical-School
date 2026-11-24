import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { GatheringCard } from "@/components/community/gathering-card";
import { PostCard } from "@/components/community/post-card";
import { CoverArt, Geometry } from "@/components/geometry";
import { Badge, Container, EmptyState, Eyebrow, LinkButton, PageHeader } from "@/components/ui";
import { currentUser } from "@/lib/auth/session";
import { feed, listCircles, listProjects, upcomingGatherings } from "@/lib/community";
import { studyArea } from "@/lib/study-areas";

export const metadata = { title: "Community" };
export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const user = await currentUser();
  const circles = listCircles(user?.id);
  const recent = feed({ viewerId: user?.id, limit: 6 });
  const gatherings = upcomingGatherings({ viewerId: user?.id, limit: 3 });
  const projects = listProjects().slice(0, 3);
  const joined = circles.filter((c) => c.joined);

  return (
    <Container className="py-14">
      <PageHeader
        eyebrow="Community"
        title="Learn together, act together"
        actions={
          user ? (
            <LinkButton href="/community/gatherings/new" variant="secondary">
              Host a gathering
            </LinkButton>
          ) : (
            <LinkButton href="/sign-up">Join the community</LinkButton>
          )
        }
      >
        When individuals transform, families and communities can too. Meet fellow students in circles, gather live, and join Wisdom
        in Action projects that put what you&rsquo;re learning to work for others.
      </PageHeader>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-12">
          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-3xl font-semibold">Circles</h2>
              {user && joined.length ? <p className="text-sm text-muted">You&rsquo;re in {joined.length}</p> : null}
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {circles.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/community/circles/${c.slug}`}
                    className="group flex h-full items-start gap-3 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-line-strong"
                  >
                    <Geometry motif={studyArea(c.studyArea ?? "wisdom-in-action").motif} className="mt-0.5 size-9 shrink-0 text-gold" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="font-medium text-ink">{c.name}</span>
                        {c.joined ? <Badge tone="sage">Joined</Badge> : null}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{c.description}</span>
                      <span className="mt-1.5 flex items-center gap-1 text-xs text-muted">
                        <Users className="size-3" /> {c.members} members · {c.postCount} posts
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-3xl font-semibold">Recently shared</h2>
            <div className="mt-5 space-y-4">
              {recent.length ? (
                recent.map((p) => <PostCard key={p.id} post={p} viewerId={user?.id} showCircle />)
              ) : (
                <EmptyState title="It's quiet here">Be the first to share a reflection in one of the circles.</EmptyState>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-10">
          <section>
            <div className="flex items-baseline justify-between">
              <Eyebrow>Upcoming gatherings</Eyebrow>
              <Link href="/community/gatherings" className="text-sm text-muted hover:text-ink">
                All
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {gatherings.length ? (
                gatherings.map((g) => <GatheringCard key={g.id} g={g} viewerId={user?.id} compact />)
              ) : (
                <p className="text-sm text-muted">No gatherings scheduled yet.</p>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-baseline justify-between">
              <Eyebrow>Wisdom in Action projects</Eyebrow>
              <Link href="/community/projects" className="text-sm text-muted hover:text-ink">
                All
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/community/projects/${p.slug}`}
                  className="flex gap-3 overflow-hidden rounded-2xl border border-line bg-surface p-3 hover:border-line-strong"
                >
                  <CoverArt area={p.studyArea} seed={p.slug} className="size-16 shrink-0 rounded-xl" />
                  <span className="min-w-0">
                    <span className="block font-medium leading-snug text-ink">{p.title}</span>
                    <span className="mt-0.5 line-clamp-2 block text-xs text-muted">{p.summary}</span>
                  </span>
                </Link>
              ))}
              <Link href="/community/projects/new" className="inline-flex items-center gap-1 text-sm font-medium text-ink">
                Start a project <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </Container>
  );
}
