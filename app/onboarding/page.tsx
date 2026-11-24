import { eq } from "drizzle-orm";
import { JourneyForm } from "@/components/journey-form";
import { Container, Eyebrow } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { journeys } from "@/lib/db/schema";

export const metadata = { title: "Begin" };

export default async function OnboardingPage() {
  const user = await requireUser("/onboarding");
  const journey = getDb().select().from(journeys).where(eq(journeys.userId, user.id)).get();
  return (
    <Container className="max-w-3xl py-14">
      <Eyebrow>Welcome, {user.name.split(" ")[0]}</Eyebrow>
      <h1 className="font-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Let&rsquo;s begin where you are.</h1>
      <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-muted">
        A few questions help Sophia, your guide, meet you where you are. What you share stays private to you and is
        used only to shape your guidance.
      </p>
      <div className="mt-10">
        <JourneyForm initial={journey ?? undefined} />
      </div>
    </Container>
  );
}
