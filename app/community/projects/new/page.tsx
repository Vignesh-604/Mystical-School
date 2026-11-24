import { ProjectForm } from "@/components/community/project-form";
import { Container, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";

export const metadata = { title: "Start a project" };

export default async function NewProjectPage() {
  await requireUser("/community/projects/new");
  return (
    <Container className="max-w-2xl py-14">
      <PageHeader eyebrow="Wisdom in Action" title="Start a project">
        Keep it modest, specific and repeatable. Grand plans are a favourite hiding place for the ego; steady, humble acts change
        things.
      </PageHeader>
      <div className="mt-10">
        <ProjectForm />
      </div>
    </Container>
  );
}
