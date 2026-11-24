import { asc, eq } from "drizzle-orm";
import { GatheringForm } from "@/components/community/gathering-form";
import { Container, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { circles, projectMembers, projects } from "@/lib/db/schema";
import { capabilities } from "@/lib/env";

export const metadata = { title: "Host a gathering" };

export default async function NewGatheringPage({ searchParams }: { searchParams: Promise<{ project?: string; circle?: string }> }) {
  const user = await requireUser("/community/gatherings/new");
  const sp = await searchParams;
  const db = getDb();
  const circleOptions = db.select({ id: circles.id, name: circles.name }).from(circles).orderBy(asc(circles.position)).all();
  const myProjects = db
    .select({ id: projects.id, title: projects.title })
    .from(projectMembers)
    .innerJoin(projects, eq(projects.id, projectMembers.projectId))
    .where(eq(projectMembers.userId, user.id))
    .all();
  const places = [
    ...myProjects.map((p) => ({ value: `project:${p.id}`, label: `Project: ${p.title}` })),
    ...circleOptions.map((c) => ({ value: `circle:${c.id}`, label: `Circle: ${c.name}` })),
  ];
  const defaultWhere = sp.project ? `project:${sp.project}` : sp.circle ? `circle:${sp.circle}` : undefined;

  return (
    <Container className="max-w-2xl py-14">
      <PageHeader eyebrow="Community" title="Host a gathering">
        A shared sit, a study evening, a project planning call. Keep it simple and welcoming.
      </PageHeader>
      <div className="mt-10">
        <GatheringForm places={places} defaultWhere={defaultWhere} smartmeet={capabilities().smartmeet} />
      </div>
    </Container>
  );
}
