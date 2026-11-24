import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { GuideApp } from "@/components/guide/guide-app";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { journeys } from "@/lib/db/schema";
import { capabilities } from "@/lib/env";
import { relativeTime } from "@/lib/format";
import { CRISIS_RESOURCES } from "@/lib/guide/safety";
import { conversationMessages, listConversations, ownedConversation } from "@/lib/guide/store";
import { chatAllowance, planFor, videoAllowance, voiceAllowance } from "@/lib/membership";

export const metadata = { title: "Sophia" };
export const dynamic = "force-dynamic";

const SUGGESTIONS: Record<string, string> = {
  "self-knowledge": "Help me understand why I react so strongly to criticism.",
  consciousness: "What do different traditions mean by 'awareness'?",
  "universal-principles": "How can I feel more connected to nature in a city?",
  meditation: "I'd like to start meditating. Where do I begin?",
  "spiritual-wisdom": "What do the world's traditions share about compassion?",
  "holistic-wellbeing": "How can I bring more balance to a very busy week?",
  "sacred-geometry": "What is the seed of life, and why does it appear in so many cultures?",
  ethics: "I have a hard decision at work. Can you help me think it through?",
  "wisdom-in-action": "How can I turn what I'm learning into something useful for others?",
};
const DEFAULT_SUGGESTIONS = [
  "I'd like to start meditating. Where do I begin?",
  "Help me reflect on my day.",
  "What is a mystical school, really?",
  "How can I turn what I'm learning into something useful for others?",
];

export default async function GuidePage({ searchParams }: { searchParams: Promise<{ c?: string; new?: string; mode?: string; ask?: string }> }) {
  const user = await requireUser("/guide");
  const journey = getDb().select().from(journeys).where(eq(journeys.userId, user.id)).get();
  if (!journey?.onboardedAt) redirect("/onboarding");
  const sp = await searchParams;

  const conversations = listConversations(user.id);
  let activeId: string | null = null;
  if (sp.c && ownedConversation(user.id, sp.c)) activeId = sp.c;
  else if (!sp.new && !sp.c && conversations[0]) activeId = conversations[0].id;

  const messages = activeId
    ? conversationMessages(activeId).map((m) => ({ id: m.id, role: m.role, content: m.content }))
    : [];

  const focusSuggestions = (journey.focusAreas ?? []).map((k) => SUGGESTIONS[k]).filter(Boolean) as string[];
  const suggestions = [...new Set([...focusSuggestions, ...DEFAULT_SUGGESTIONS])].slice(0, 4);

  const chat = chatAllowance(user.id);
  const voice = voiceAllowance(user.id);
  const video = videoAllowance(user.id);
  const caps = capabilities();

  return (
    <GuideApp
      firstName={user.name.split(" ")[0] ?? user.name}
      plan={planFor(user.id)}
      conversations={conversations.map((c) => ({ id: c.id, title: c.title, mode: c.mode, updatedLabel: relativeTime(c.updatedAt) }))}
      activeId={activeId}
      initialMessages={messages}
      chat={{ remaining: chat.remaining, limit: chat.limit }}
      voice={{ remainingSeconds: voice.remaining, limitSeconds: voice.limit }}
      video={{ remainingSeconds: video.remaining, limitSeconds: video.limit }}
      capabilities={{ text: caps.text, voice: caps.voice, video: caps.video }}
      suggestions={suggestions}
      safetyCards={CRISIS_RESOURCES}
      initialMode={sp.mode === "voice" || sp.mode === "video" ? sp.mode : "text"}
      initialInput={sp.ask ? sp.ask.slice(0, 500) : undefined}
    />
  );
}
