import { RetreatCard } from "@/components/retreat-card";
import { Container, EmptyState, PageHeader } from "@/components/ui";
import { listRetreats } from "@/lib/retreats";

export const metadata = { title: "Retreats" };
export const dynamic = "force-dynamic";

export default function RetreatsPage() {
  const retreats = listRetreats();
  return (
    <Container className="py-14">
      <PageHeader eyebrow="Retreats" title="Step away, together">
        Small-group, in-person retreats in places of deep stillness. Each one weaves teaching and practice with a day of service, so
        what you find there comes home with you.
      </PageHeader>
      {retreats.length === 0 ? (
        <EmptyState className="mt-12" title="New retreats are being planned">
          Check back soon, or ask Sophia to let you know what the school is preparing.
        </EmptyState>
      ) : (
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {retreats.map((r) => (
            <RetreatCard key={r.id} retreat={r} />
          ))}
        </div>
      )}
    </Container>
  );
}
