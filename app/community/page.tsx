import { ArrowRight, ArrowUpRight, Users } from "lucide-react";
import Link from "next/link";
import { GatheringCard } from "@/components/community/gathering-card";
import { PostCard } from "@/components/community/post-card";
import { CoverArt, Geometry } from "@/components/geometry";
import { Container, EmptyState, Eyebrow, LinkButton, PageHeader } from "@/components/ui";
import { currentUser } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
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

  return (
    <Container className="py-16">
      <PageHeader
        eyebrow="Community"
        title={<>Learn together, <em>act together.</em></>}
        photo="community"
        actions={
          user ? (
            <>
              <LinkButton href="/community/gatherings/new">Host a gathering</LinkButton>
              <LinkButton href="/community/projects/new" variant="secondary">
                Start a project
              </LinkButton>
            </>
          ) : (
            <LinkButton href="/sign-up">Join the community</LinkButton>
          )
        }
      >
        When individuals transform, families and communities can too. Meet fellow students in circles, gather live, and join Wisdom
        in Action projects that put what you&rsquo;re learning to work for others.
      </PageHeader>

      <section className="mt-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Eyebrow>Circles</Eyebrow>
            <h2 className="font-display mt-3 text-5xl">Find your people</h2>
          </div>
          {user ? <p className="text-sm text-muted">You&rsquo;re in {circles.filter((c) => c.joined).length} of {circles.length}</p> : null}
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {circles.map((c) => (
            <li key={c.id}>
              <Link
                href={`/community/circles/${c.slug}`}
                className={cn(
                  "lift group flex h-full items-start gap-4 rounded-[var(--radius-card)] border bg-surface p-5 shadow-[var(--shadow-sm)]",
                  c.joined ? "border-moss/30" : "border-line",
                )}
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-moss-soft text-moss">
                  <Geometry motif={studyArea(c.studyArea ?? "wisdom-in-action").motif} className="size-8" strokeWidth={1.2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display text-2xl leading-tight text-ink">{c.name}</span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted transition-colors group-hover:text-gold" />
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-muted">{c.description}</span>
                  <span className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                    <Users className="size-3.5" /> {c.members} members · {c.postCount} posts
                    {c.joined ? <span className="ml-1 rounded-full bg-moss-soft px-2 py-0.5 font-medium text-moss">Joined</span> : null}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-24 grid gap-14 lg:grid-cols-[1fr_22rem]">
        <section className="min-w-0">
          <Eyebrow>Recently shared</Eyebrow>
          <h2 className="font-display mt-3 text-5xl">From the circles</h2>
          <div className="mt-8 space-y-4">
            {recent.length ? (
              recent.map((p) => <PostCard key={p.id} post={p} viewerId={user?.id} showCircle />)
            ) : (
              <EmptyState title="It's quiet here">Be the first to share a reflection in one of the circles.</EmptyState>
            )}
          </div>
        </section>

        <aside className="space-y-12 lg:sticky lg:top-28 lg:self-start">
          <section>
            <div className="flex items-baseline justify-between">
              <Eyebrow>Gatherings</Eyebrow>
              <Link href="/community/gatherings" className="text-sm text-muted hover:text-ink">
                See all
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {gatherings.length ? (
                gatherings.map((g) => <GatheringCard key={g.id} g={g} viewerId={user?.id} compact />)
              ) : (
                <p className="text-sm text-muted">No gatherings scheduled yet.</p>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-baseline justify-between">
              <Eyebrow>Wisdom in Action</Eyebrow>
              <Link href="/community/projects" className="text-sm text-muted hover:text-ink">
                See all
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {projects.map((p) => (
                <Link key={p.id} href={`/community/projects/${p.slug}`} className="lift flex gap-4 rounded-2xl border border-line bg-surface p-3">
                  <CoverArt area={p.studyArea} seed={p.slug} label={false} className="size-20 shrink-0 rounded-xl" />
                  <span className="min-w-0 py-1">
                    <span className="block font-display text-xl leading-tight text-ink">{p.title}</span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-muted">{p.summary}</span>
                  </span>
                </Link>
              ))}
              <Link href="/community/projects/new" className="inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-moss">
                Start a project <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </Container>
  );
}
