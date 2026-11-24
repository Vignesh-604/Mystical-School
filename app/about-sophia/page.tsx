import { Geometry } from "@/components/geometry";
import { Container, Eyebrow, LinkButton } from "@/components/ui";

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
      "She's also designed to build your independence rather than your reliance on her: she'll point you to your own wisdom, your relationships, the community, and human teachers.",
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
    body: [
      "Sophia doesn't sell. She'll describe the school's courses and retreats honestly if you ask, and the limits of your plan are always shown plainly on screen.",
    ],
  },
];

export default function AboutSophiaPage() {
  return (
    <Container className="max-w-3xl py-14">
      <Geometry motif="seed" className="size-14 text-gold" />
      <Eyebrow className="mt-6">Transparency</Eyebrow>
      <h1 className="font-display mt-2 text-5xl font-semibold">How Sophia works</h1>
      <div className="mt-10 space-y-10">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-3xl font-semibold">{s.title}</h2>
            <div className="mt-3 space-y-3 text-[1.05rem] leading-relaxed text-ink-2">
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-12 flex gap-3">
        <LinkButton href="/guide">Talk with Sophia</LinkButton>
        <LinkButton href="/support" variant="secondary">
          Support resources
        </LinkButton>
      </div>
    </Container>
  );
}
