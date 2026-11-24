import { requireAdmin } from "@/lib/auth/session";
import { desc, eq } from "drizzle-orm";
import { resolveReportAction } from "@/app/actions/admin";
import { Button, Card, EmptyState } from "@/components/ui";
import { getDb } from "@/lib/db";
import { comments, posts, projectUpdates, reports, users } from "@/lib/db/schema";
import { relativeTime } from "@/lib/format";

export const metadata = { title: "Moderation · Admin" };
export const dynamic = "force-dynamic";

function targetText(type: string, id: string): string {
  const db = getDb();
  const row =
    type === "post"
      ? db.select({ body: posts.body }).from(posts).where(eq(posts.id, id)).get()
      : type === "comment"
        ? db.select({ body: comments.body }).from(comments).where(eq(comments.id, id)).get()
        : db.select({ body: projectUpdates.body }).from(projectUpdates).where(eq(projectUpdates.id, id)).get();
  return row?.body ?? "(deleted)";
}

export default async function AdminReports() {
  await requireAdmin();
  const open = getDb()
    .select({ r: reports, reporter: users.name })
    .from(reports)
    .innerJoin(users, eq(users.id, reports.reporterId))
    .where(eq(reports.status, "open"))
    .orderBy(desc(reports.createdAt))
    .all();

  if (open.length === 0) return <EmptyState title="Nothing to review">Reports from members will appear here.</EmptyState>;

  return (
    <ul className="space-y-4">
      {open.map(({ r, reporter }) => (
        <li key={r.id}>
          <Card className="p-5">
            <p className="text-xs text-muted">
              {r.targetType.replace("_", " ")} reported by {reporter} · {relativeTime(r.createdAt)}
            </p>
            <p className="mt-2 text-sm font-medium text-ink">Reason: {r.reason}</p>
            <blockquote className="mt-3 whitespace-pre-wrap rounded-xl bg-surface-2 p-3 text-sm text-ink-2">
              {targetText(r.targetType, r.targetId)}
            </blockquote>
            <div className="mt-4 flex gap-2">
              <form action={resolveReportAction}>
                <input type="hidden" name="reportId" value={r.id} />
                <input type="hidden" name="decision" value="hide" />
                <Button size="sm" variant="danger">
                  Hide content
                </Button>
              </form>
              <form action={resolveReportAction}>
                <input type="hidden" name="reportId" value={r.id} />
                <input type="hidden" name="decision" value="dismiss" />
                <Button size="sm" variant="secondary">
                  Dismiss
                </Button>
              </form>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
