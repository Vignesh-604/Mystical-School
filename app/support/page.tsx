import { Container, Eyebrow, Notice } from "@/components/ui";
import { CRISIS_RESOURCES } from "@/lib/guide/safety";

export const metadata = { title: "If you need support now" };

export default function SupportPage() {
  return (
    <Container className="max-w-3xl py-14">
      <Eyebrow>Care</Eyebrow>
      <h1 className="font-display mt-2 text-5xl">If you need support now</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        Spiritual practice can be a great comfort, but some moments need human help, quickly. There is no shame in reaching out. It
        is an act of courage and of care for yourself.
      </p>
      <Notice tone="rose" className="mt-8 text-base" title="In immediate danger?">
        Call your local emergency number now: for example 911 (US and Canada), 999 (UK), or 112 (EU, India and many other countries).
      </Notice>
      <div className="mt-10 space-y-8">
        {Object.values(CRISIS_RESOURCES).map((r) => (
          <section key={r.title}>
            <h2 className="font-display text-3xl">{r.title}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[1.05rem] leading-relaxed text-ink-2">
              {r.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-12 text-sm text-muted">
        Sophia, the school&rsquo;s guide, is an AI. She can listen and offer reflection, but she can&rsquo;t contact anyone for you or
        replace a doctor, counsellor or emergency service.
      </p>
    </Container>
  );
}
