import { Users } from "lucide-react";
import Link from "next/link";
import { CoverArt } from "@/components/geometry";
import { Badge, Container, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { currentUser } from "@/lib/auth/session";
import { listProjects } from "@/lib/community";
import { studyArea } from "@/lib/study-areas";
import { PROJECT_STATUS as STATUS } from "@/components/community/status";

export const metadata = { title: "Wisdom in Action projects" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await currentUser();
  const projects = listProjects();
  return (
    <Container className="py-14">
      <PageHeader
        eyebrow="Wisdom in Action"
        title="Projects that serve"
        actions={
          <LinkButton href={user ? "/community/projects/new" : "/sign-in?next=/community/projects/new"}>Start a project</LinkButton>
        }
      >
        Every subject at the school has a practical application and a contribution to society. These are the ones members are
        building together. Join one, or start your own.
      </PageHeader>
      {projects.length === 0 ? (
        <EmptyState className="mt-12" title="No projects yet" action={<LinkButton href="/community/projects/new">Start the first</LinkButton>}>
          Projects can be small: a weekly sit for caregivers, a tree-planting circle, an evening of shared questions.
        </EmptyState>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/community/projects/${p.slug}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <CoverArt area={p.studyArea} seed={p.slug} className="aspect-[16/9]" />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2">
                  <Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge>
                  <span className="text-xs text-muted">{studyArea(p.studyArea).name}</span>
                </div>
                <h2 className="font-display mt-2 text-2xl leading-tight">{p.title}</h2>
                <p className="mt-1 text-sm text-muted">{p.summary}</p>
                <p className="mt-auto flex items-center gap-1 pt-4 text-xs text-muted">
                  <Users className="size-3.5" /> {p.members} {p.members === 1 ? "member" : "members"} · led by {p.ownerName}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
