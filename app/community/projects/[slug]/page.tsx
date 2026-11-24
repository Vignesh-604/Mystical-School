import { ArrowLeft, HandHeart } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setProjectStatusAction, toggleProjectMembershipAction } from "@/app/actions/community";
import { ProjectUpdateForm, ReportButton } from "@/components/community/forms";
import { GatheringCard } from "@/components/community/gathering-card";
import { CoverArt } from "@/components/geometry";
import { PendingButton } from "@/components/pending-button";
import { Badge, Card, Container, Eyebrow, Initials, LinkButton } from "@/components/ui";
import { currentUser } from "@/lib/auth/session";
import { getProject, upcomingGatherings } from "@/lib/community";
import { relativeTime } from "@/lib/format";
import { studyArea } from "@/lib/study-areas";
import { PROJECT_STATUS as STATUS } from "@/components/community/status";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: getProject((await params).slug)?.project.title ?? "Project" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getProject(slug);
  if (!data) notFound();
  const { project, members, updates } = data;
  const user = await currentUser();
  const me = user ? members.find((m) => m.id === user.id) : undefined;
  const isLead = me?.role === "lead";
  const gatherings = upcomingGatherings({ projectId: project.id, viewerId: user?.id });

  return (
    <>
      <CoverArt area={project.studyArea} seed={project.slug} className="border-b border-line">
        <Container className="py-14 sm:py-20">
          <Link href="/community/projects" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="size-4" /> Projects
          </Link>
          <div className="mt-5 flex items-center gap-2">
            <Badge tone={STATUS[project.status].tone}>{STATUS[project.status].label}</Badge>
            <span className="text-sm text-white/70">{studyArea(project.studyArea).name}</span>
          </div>
          <h1 className="font-display mt-3 max-w-3xl text-5xl font-semibold leading-[1.02] text-white">{project.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/80">{project.summary}</p>
        </Container>
      </CoverArt>

      <Container className="grid gap-10 py-12 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <p className="whitespace-pre-wrap text-lg leading-relaxed text-ink-2">{project.description}</p>
          {project.helpWanted ? (
            <div className="mt-8 rounded-2xl border border-gold/30 bg-gold-soft/40 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-gold-ink">
                <HandHeart className="size-4" /> Help wanted
              </p>
              <p className="mt-1 text-ink">{project.helpWanted}</p>
            </div>
          ) : null}

          {gatherings.length ? (
            <section className="mt-12">
              <Eyebrow>Gatherings</Eyebrow>
              <div className="mt-4 space-y-3">
                {gatherings.map((g) => (
                  <GatheringCard key={g.id} g={g} viewerId={user?.id} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-12">
            <h2 className="font-display text-3xl font-semibold">Updates</h2>
            {me ? (
              <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
                <ProjectUpdateForm projectId={project.id} />
              </div>
            ) : null}
            <ol className="mt-6 space-y-4">
              {updates.length ? (
                updates.map((u) => (
                  <li key={u.id} className="flex gap-3">
                    <Initials name={u.authorName} />
                    <div className="min-w-0 flex-1 rounded-2xl border border-line bg-surface p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm">
                          <Link href={`/members/${u.authorId}`} className="font-medium text-ink hover:underline">
                            {u.authorName}
                          </Link>{" "}
                          <span className="text-muted">· {relativeTime(u.createdAt)}</span>
                        </p>
                        {user && user.id !== u.authorId ? <ReportButton targetType="project_update" targetId={u.id} /> : null}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap leading-relaxed text-ink-2">{u.body}</p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted">No updates yet.</li>
              )}
            </ol>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            {user ? (
              isLead ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted">You lead this project.</p>
                  <form action={setProjectStatusAction} className="flex gap-2">
                    <input type="hidden" name="projectId" value={project.id} />
                    <select
                      name="status"
                      defaultValue={project.status}
                      aria-label="Project status"
                      className="h-9 flex-1 rounded-full border border-line-strong bg-surface px-3 text-sm"
                    >
                      <option value="forming">Forming</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                    <PendingButton size="sm" variant="secondary" pendingLabel="…">
                      Update
                    </PendingButton>
                  </form>
                  <LinkButton href={`/community/gatherings/new?project=${project.id}`} variant="secondary" size="sm" className="w-full">
                    Schedule a gathering
                  </LinkButton>
                </div>
              ) : (
                <div className="space-y-3">
                  <form action={toggleProjectMembershipAction}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <PendingButton className="w-full" variant={me ? "secondary" : "primary"} pendingLabel="…">
                      {me ? "Leave project" : "Join this project"}
                    </PendingButton>
                  </form>
                  {me ? (
                    <LinkButton href={`/community/gatherings/new?project=${project.id}`} variant="ghost" size="sm" className="w-full">
                      Schedule a gathering
                    </LinkButton>
                  ) : null}
                </div>
              )
            ) : (
              <LinkButton href={`/sign-in?next=/community/projects/${project.slug}`} className="w-full">
                Sign in to join
              </LinkButton>
            )}
          </Card>
          <div>
            <Eyebrow>{members.length} {members.length === 1 ? "member" : "members"}</Eyebrow>
            <ul className="mt-3 space-y-2">
              {members.map((m) => (
                <li key={m.id}>
                  <Link href={`/members/${m.id}`} className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-surface-2">
                    <Initials name={m.name} className="size-8 text-xs" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">{m.name}</span>
                      <span className="block text-xs text-muted">
                        {m.role === "lead" ? "Lead" : "Member"}
                        {m.location ? ` · ${m.location}` : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </Container>
    </>
  );
}
