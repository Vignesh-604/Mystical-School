import { RetreatCard } from "@/components/retreat-card";
import { Container, EmptyState, PageHeader } from "@/components/ui";
import { listRetreats } from "@/lib/retreats";

export const metadata = { title: "Retreats" };
export const dynamic = "force-dynamic";

export default function RetreatsPage() {
  const retreats = listRetreats();
  return (
    <Container className="py-16">
      <PageHeader eyebrow="In-person retreats" title={<>Step away, <em>together.</em></>} photo="courses">
        Small-group retreats in places of deep stillness. Each weaves teaching and practice with a day of service, so what you find
        there comes home with you.
      </PageHeader>
      {retreats.length === 0 ? (
        <EmptyState className="mt-16" title="New retreats are being planned">
          Check back soon, or ask Sophia what the school is preparing.
        </EmptyState>
      ) : (
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {retreats.map((r, i) => (
            <RetreatCard key={r.id} index={i} retreat={r} />
          ))}
        </div>
      )}
    </Container>
  );
}
