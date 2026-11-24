import { desc, eq } from "drizzle-orm";
import { Trash2 } from "lucide-react";
import { deleteJournalEntryAction } from "@/app/actions/journal";
import { JournalForm } from "@/components/journal-form";
import { Markdown } from "@/components/markdown";
import { Badge, Card, Container, EmptyState, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { journalEntries } from "@/lib/db/schema";
import { shortDate } from "@/lib/format";

export const metadata = { title: "Journal" };

const KIND = {
  reflection: { label: "Reflection", tone: "indigo" },
  practice: { label: "Practice", tone: "sage" },
  action: { label: "Wisdom in Action", tone: "gold" },
  insight: { label: "Insight", tone: "neutral" },
} as const;

export default async function JournalPage() {
  const user = await requireUser("/journal");
  const entries = getDb()
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, user.id))
    .orderBy(desc(journalEntries.createdAt))
    .limit(200)
    .all();

  return (
    <Container className="max-w-3xl py-12">
      <PageHeader eyebrow="Private to you" title="Your journal">
        Reflections, practices, lesson notes and words from Sophia worth keeping. No one else can read your journal.
      </PageHeader>

      <Card className="mt-10 p-6">
        <JournalForm />
      </Card>

      <div className="mt-10 space-y-4">
        {entries.length === 0 ? (
          <EmptyState title="Nothing here yet">
            Write your first reflection above, or save a reply from Sophia with &ldquo;Save to journal&rdquo;.
          </EmptyState>
        ) : (
          entries.map((e) => (
            <article key={e.id} className="rounded-2xl border border-line bg-surface p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge tone={KIND[e.kind].tone}>{KIND[e.kind].label}</Badge>
                    <span className="text-xs text-muted">{shortDate(e.createdAt)}</span>
                    {e.source === "guide" ? <span className="text-xs text-muted">· from Sophia</span> : null}
                    {e.source?.startsWith("lesson:") ? <span className="text-xs text-muted">· from a lesson</span> : null}
                  </div>
                  <h2 className="font-display mt-2 text-2xl font-semibold text-ink">{e.title}</h2>
                </div>
                <form action={deleteJournalEntryAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <button className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-rose" aria-label={`Delete entry ${e.title}`}>
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </div>
              <Markdown text={e.body} className="prose-chat mt-3 text-ink-2" />
            </article>
          ))
        )}
      </div>
    </Container>
  );
}
