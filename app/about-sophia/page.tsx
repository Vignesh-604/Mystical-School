import { Container, LinkButton, PageHeader } from "@/components/ui";

export const metadata = { title: "How Sophia works" };

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "Sophia is an AI",
    body: [
      "Sophia is an artificial intelligence, not a person, guru, therapist or oracle. She has no supernatural knowledge. She draws on what the world's wisdom traditions teach and helps you reflect, practise and act.",
      "She can be wrong. Treat her guidance the way the school asks you to treat any teaching: examine it, try it, reflect on it, and keep what proves true in your life.",
    ],
  },
  {
    title: "What she's designed to do",
    body: [
      "Ask good questions before giving long answers. Connect insight to a small practice you can do today, and, where it fits, to how it might help someone else. Respect every tradition and never ask you to leave your own.",
      "She's designed to build your independence rather than your reliance on her: she'll point you to your own wisdom, your relationships, the community, and human teachers.",
    ],
  },
  {
    title: "When things are hard",
    body: [
      "If you mention thoughts of suicide or self-harm, abuse, or a medical emergency, Sophia responds with care and the page shows you where to find human help immediately. She can't contact anyone for you.",
      "Sophia never gives medical, psychiatric, legal or financial advice, and spiritual practice is never a substitute for professional care.",
    ],
  },
  {
    title: "Your privacy",
    body: [
      "Your conversations are stored in the school's database so you can return to them, and you can delete any conversation at any time.",
      "To answer you, your messages and a short summary of your journey (your intention, focus areas and, on the Initiate plan, Sophia's notes) are sent to the AI providers that power her: Anthropic's Claude models via OpenRouter for text, Google Gemini for voice, and Tavus for face-to-face video. Message content is never written to the school's server logs.",
    ],
  },
  {
    title: "No pressure",
    body: ["Sophia doesn't sell. She'll describe the school's courses and retreats honestly if you ask, and the limits of your plan are always shown plainly on screen."],
  },
];

export default function AboutSophiaPage() {
  return (
    <Container className="py-16">
      <PageHeader eyebrow="Transparency" title={<>How Sophia <em>works.</em></>} photo="sophia">
        Plain answers about what the school&rsquo;s AI guide is, what she does with what you share, and what she will never do.
      </PageHeader>
      <div className="mx-auto mt-20 max-w-3xl divide-y divide-line border-y border-line">
        {SECTIONS.map((s, i) => (
          <section key={s.title} className="grid gap-4 py-10 sm:grid-cols-[3rem_1fr]">
            <span className="font-display text-2xl text-gold">0{i + 1}</span>
            <div>
              <h2 className="font-display text-4xl leading-tight">{s.title}</h2>
              <div className="mt-4 space-y-4 text-[1.06rem] leading-relaxed text-ink-2">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-3xl flex-wrap gap-3">
        <LinkButton href="/guide">Talk with Sophia</LinkButton>
        <LinkButton href="/support" variant="secondary">
          Support resources
        </LinkButton>
      </div>
    </Container>
  );
}
