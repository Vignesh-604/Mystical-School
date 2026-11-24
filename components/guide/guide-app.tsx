"use client";

import {
  ArrowUp,
  BookmarkPlus,
  Check,
  Headphones,
  Lock,
  MessageSquareText,
  Mic,
  MicOff,
  PanelLeft,
  Plus,
  Square,
  Trash2,
  Video,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { deleteConversationAction, saveToJournalAction } from "@/app/actions/guide";
import { cn } from "@/lib/cn";
import { Markdown } from "../markdown";
import { Button, LinkButton, Notice } from "../ui";
import { MicMeter } from "./mic-meter";
import { Presence, type PresenceState } from "./presence";
import { useGeminiVoice } from "./use-gemini-voice";

type Msg = { id: string; role: "user" | "assistant"; content: string; pending?: boolean };
type ConversationItem = { id: string; title: string; mode: "text" | "voice" | "video"; updatedLabel: string };
type SafetyCard = { title: string; lines: string[] };

export type GuideProps = {
  firstName: string;
  plan: "seeker" | "initiate";
  conversations: ConversationItem[];
  activeId: string | null;
  initialMessages: Msg[];
  chat: { remaining: number; limit: number };
  voice: { remainingSeconds: number; limitSeconds: number };
  video: { remainingSeconds: number; limitSeconds: number };
  capabilities: { text: boolean; voice: boolean; video: boolean };
  suggestions: string[];
  safetyCards: Record<string, SafetyCard>;
  initialMode: "text" | "voice" | "video";
  initialInput?: string;
};

const minutes = (s: number) => `${Math.floor(s / 60)} min`;
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function GuideApp(props: GuideProps) {
  const router = useRouter();
  const [mode, setMode] = useState(props.initialMode);
  const [conversationId, setConversationId] = useState<string | null>(props.activeId);
  const [messages, setMessages] = useState<Msg[]>(props.initialMessages);
  const [input, setInput] = useState(props.initialInput ?? "");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [remaining, setRemaining] = useState(props.chat.remaining);
  const [safety, setSafety] = useState<SafetyCard | null>(null);
  const [railOpen, setRailOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setConversationId(props.activeId);
    setMessages(props.initialMessages);
    setSafety(null);
    setError(null);
  }, [props.activeId, props.initialMessages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || streaming) return;
    setError(null);
    setInput("");
    const replyId = `reply-${Date.now()}`;
    setMessages((m) => [...m, { id: `local-${Date.now()}`, role: "user", content: message }, { id: replyId, role: "assistant", content: "", pending: true }]);
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/guide/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: conversationId ?? undefined, message }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => ({}));
        setMessages((m) => m.filter((x) => x.id !== replyId));
        if (json.conversationId && !conversationId) setConversationId(json.conversationId);
        setError({ message: json.error ?? "Something went wrong.", code: json.code });
        if (json.code === "limit") setRemaining(0);
        return;
      }
      const cid = res.headers.get("X-Conversation-Id");
      const flag = res.headers.get("X-Safety-Flag");
      const left = res.headers.get("X-Remaining");
      if (flag && props.safetyCards[flag]) setSafety(props.safetyCards[flag]!);
      if (left) setRemaining(Number(left));
      const isNew = !conversationId && cid;
      if (cid) setConversationId(cid);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => m.map((x) => (x.id === replyId ? { ...x, content: acc, pending: false } : x)));
      }
      if (isNew) router.replace(`/guide?c=${cid}`, { scroll: false });
      else router.refresh();
    } catch (err) {
      if ((err as Error).name !== "AbortError") setError({ message: "The connection was interrupted. Please try again." });
      setMessages((m) => m.filter((x) => !(x.id === replyId && !x.content)));
    } finally {
      setStreaming(false);
      abortRef.current = null;
      textareaRef.current?.focus();
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(input);
    }
  }

  const limitReached = remaining <= 0;
  const allowance =
    mode === "text"
      ? `${remaining} of ${props.chat.limit} messages left today`
      : mode === "voice"
        ? `${minutes(props.voice.remainingSeconds)} of voice left today`
        : props.plan === "initiate"
          ? `${minutes(props.video.remainingSeconds)} left this month`
          : "Initiate plan";

  return (
    <div className="mx-auto flex h-[calc(100dvh-4.5rem)] max-w-[100rem]">
      {/* Conversations */}
      <aside
        aria-label="Conversations"
        className={cn(
          "fixed bottom-0 left-0 top-[4.5rem] z-30 flex w-80 flex-col border-r border-line bg-bg/95 backdrop-blur-xl transition-transform md:relative md:top-0 md:translate-x-0 md:bg-surface/40",
          railOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted">Conversations</p>
          <button onClick={() => setRailOpen(false)} aria-label="Close conversations" className="rounded-full p-1.5 text-muted hover:bg-surface-2 md:hidden">
            <X className="size-4" />
          </button>
        </div>
        <div className="px-4">
          <Link
            href="/guide?new=1"
            onClick={() => {
              setRailOpen(false);
              setMode("text");
            }}
            className="flex items-center justify-center gap-2 rounded-full bg-moss px-4 py-2.5 text-sm font-medium text-bg shadow-soft transition-colors hover:bg-moss-2 dark:text-night"
          >
            <Plus className="size-4" /> New conversation
          </Link>
        </div>
        <nav className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
          {props.conversations.length === 0 ? (
            <p className="px-3 py-6 text-sm leading-relaxed text-muted">Your conversations with Sophia will gather here, ready to return to.</p>
          ) : (
            <ul className="space-y-0.5">
              {props.conversations.map((c) => (
                <li key={c.id} className="group relative">
                  <Link
                    href={`/guide?c=${c.id}`}
                    onClick={() => {
                      setRailOpen(false);
                      setMode("text");
                    }}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl px-3 py-2.5 pr-9 text-sm transition-colors",
                      c.id === conversationId ? "bg-surface text-ink shadow-[var(--shadow-sm)]" : "text-ink-2 hover:bg-surface/70",
                    )}
                  >
                    {c.mode === "voice" ? <Mic className="mt-0.5 size-3.5 shrink-0 text-gold" /> : <MessageSquareText className="mt-0.5 size-3.5 shrink-0 text-muted" />}
                    <span className="min-w-0">
                      <span className="block truncate">{c.title}</span>
                      <span className="block text-xs text-muted">{c.updatedLabel}</span>
                    </span>
                  </Link>
                  <button
                    onClick={async () => {
                      if (!confirm("Delete this conversation? This can't be undone.")) return;
                      await deleteConversationAction(c.id);
                      if (c.id === conversationId) router.push("/guide?new=1");
                      else router.refresh();
                    }}
                    className="absolute right-2 top-2.5 hidden rounded-full p-1.5 text-muted hover:bg-bg hover:text-rose focus:block group-hover:block"
                    aria-label={`Delete conversation ${c.title}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>
        <div className="flex gap-4 border-t border-line px-5 py-4 text-sm">
          <Link href="/journal" className="text-muted hover:text-ink">
            Journal
          </Link>
          <Link href="/about-sophia" className="text-muted hover:text-ink">
            How Sophia works
          </Link>
        </div>
      </aside>
      {railOpen ? <div className="fixed inset-0 top-[4.5rem] z-20 bg-night/30 backdrop-blur-sm md:hidden" onClick={() => setRailOpen(false)} /> : null}

      {/* Main */}
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
          <button className="rounded-full border border-line bg-surface/70 p-2 text-muted md:hidden" onClick={() => setRailOpen(true)} aria-label="Show conversations">
            <PanelLeft className="size-4" />
          </button>
          <div role="tablist" aria-label="How to talk with Sophia" className="mx-auto flex rounded-full border border-line bg-surface/70 p-1 shadow-[var(--shadow-sm)]">
            {(
              [
                ["text", "Write", MessageSquareText],
                ["voice", "Speak", Mic],
                ["video", "Face to face", Video],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                role="tab"
                aria-selected={mode === key}
                onClick={() => setMode(key)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors",
                  mode === key ? "bg-moss text-bg shadow-soft dark:text-night" : "text-ink-2 hover:text-ink",
                )}
              >
                <Icon className="size-4" />
                <span className={key === "video" ? "hidden sm:inline" : ""}>{label}</span>
                {key === "video" && props.plan === "seeker" ? <Lock className="size-3 opacity-60" /> : null}
              </button>
            ))}
          </div>
          <p className="hidden w-48 text-right text-xs text-muted lg:block">{allowance}</p>
        </div>

        {mode === "text" ? (
          <>
            <div ref={listRef} className="flex-1 overflow-y-auto px-4 sm:px-6" aria-live="polite">
              {messages.length === 0 ? (
                <div className="mx-auto flex max-w-2xl flex-col items-center py-10 text-center sm:py-16">
                  <Presence state="idle" className="w-44 sm:w-52" />
                  <h1 className="font-display mt-6 text-5xl sm:text-6xl">
                    Hello, <em>{props.firstName}.</em>
                  </h1>
                  <p className="mt-3 max-w-md text-[1.05rem] text-muted">I&rsquo;m Sophia, the school&rsquo;s AI guide. What would you like to explore today?</p>
                  <div className="mt-10 grid w-full gap-3 sm:grid-cols-2">
                    {props.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => void send(s)}
                        disabled={limitReached || !props.capabilities.text}
                        className="lift rounded-2xl border border-line bg-surface px-5 py-4 text-left text-[0.95rem] leading-snug text-ink-2 shadow-[var(--shadow-sm)] hover:text-ink disabled:opacity-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <ol className="mx-auto max-w-3xl space-y-8 py-10">
                  {messages.map((m) => (
                    <MessageRow key={m.id} msg={m} />
                  ))}
                </ol>
              )}
            </div>

            <div className="px-4 pb-5 pt-2 sm:px-6">
              <div className="mx-auto max-w-3xl space-y-3">
                {safety ? (
                  <div className="rounded-2xl border border-rose/25 bg-rose-soft/80 px-5 py-4 text-sm" role="alert">
                    <p className="font-semibold text-ink">{safety.title}</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-2">
                      {safety.lines.map((l) => (
                        <li key={l}>{l}</li>
                      ))}
                    </ul>
                    <Link href="/support" className="mt-2 inline-block font-medium text-ink underline underline-offset-4">
                      More support options
                    </Link>
                  </div>
                ) : null}
                {!props.capabilities.text ? <Notice tone="gold">Text guidance isn&rsquo;t configured on this server (OPENROUTER_API_KEY).</Notice> : null}
                {error ? (
                  <Notice tone={error.code === "limit" ? "gold" : "rose"}>
                    {error.message}{" "}
                    {error.code === "limit" ? (
                      <>
                        Messages refresh over the next 24 hours.{" "}
                        {props.plan === "seeker" ? (
                          <Link href="/membership" className="font-medium underline underline-offset-4">
                            See the Initiate plan
                          </Link>
                        ) : null}
                      </>
                    ) : null}
                  </Notice>
                ) : null}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void send(input);
                  }}
                  className="flex items-end gap-2 rounded-[1.6rem] border border-line bg-surface p-2.5 pl-4 shadow-lift transition-[border-color,box-shadow] focus-within:border-moss/40 focus-within:ring-4 focus-within:ring-moss/10"
                >
                  <label htmlFor="guide-input" className="sr-only">
                    Message Sophia
                  </label>
                  <textarea
                    id="guide-input"
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={1}
                    maxLength={4000}
                    disabled={limitReached || !props.capabilities.text}
                    placeholder={limitReached ? "You've reached today's messages" : "Share what's on your mind…"}
                    className="field-sizing-content max-h-52 min-h-11 flex-1 resize-none bg-transparent py-2.5 text-[1rem] text-ink placeholder:text-muted/70 focus:outline-none disabled:opacity-60"
                  />
                  {streaming ? (
                    <Button type="button" size="sm" variant="secondary" onClick={() => abortRef.current?.abort()} aria-label="Stop">
                      <Square className="size-3.5" /> Stop
                    </Button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim() || limitReached}
                      aria-label="Send"
                      className="inline-flex size-11 items-center justify-center rounded-full bg-moss text-bg transition-[opacity,transform] hover:bg-moss-2 active:scale-95 disabled:opacity-25 dark:text-night"
                    >
                      <ArrowUp className="size-4" />
                    </button>
                  )}
                </form>
                <p className="text-center text-xs text-muted">Sophia is an AI and can be wrong. She isn&rsquo;t a substitute for medical or mental-health care.</p>
              </div>
            </div>
          </>
        ) : mode === "voice" ? (
          <VoicePanel {...props} onSaved={(id) => router.push(id ? `/guide?c=${id}` : "/guide")} />
        ) : (
          <VideoPanel {...props} />
        )}
      </section>
    </div>
  );
}

function MessageRow({ msg }: { msg: Msg }) {
  const [saved, setSaved] = useState(false);
  if (msg.role === "user") {
    return (
      <li className="flex justify-end animate-fade-up">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-[1.4rem] rounded-br-md bg-moss px-5 py-3 text-[1rem] leading-relaxed text-bg shadow-soft dark:text-night">
          {msg.content}
        </div>
      </li>
    );
  }
  return (
    <li className="group flex gap-4 animate-fade-up">
      <Presence state={msg.pending ? "thinking" : "idle"} className="mt-0.5 size-9 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold">Sophia</p>
        {msg.pending ? (
          <div className="mt-3 flex h-6 items-center gap-1.5" aria-label="Sophia is reflecting">
            <span className="typing-dot size-1.5 rounded-full bg-gold" />
            <span className="typing-dot size-1.5 rounded-full bg-gold" />
            <span className="typing-dot size-1.5 rounded-full bg-gold" />
          </div>
        ) : (
          <>
            <Markdown text={msg.content} className="prose-chat mt-2 text-ink" />
            <div className="mt-3 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
              <button
                disabled={saved}
                onClick={async () => {
                  const firstLine = msg.content.replace(/[*_#>]/g, "").split(/[.\n]/)[0]?.trim().slice(0, 80) || "From Sophia";
                  const res = await saveToJournalAction({ title: firstLine, body: msg.content, kind: "insight", source: "guide" });
                  if (res.ok) setSaved(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-muted transition-colors hover:border-line-strong hover:text-ink disabled:border-moss/30 disabled:text-moss"
              >
                {saved ? <Check className="size-3.5" /> : <BookmarkPlus className="size-3.5" />}
                {saved ? "Saved to journal" : "Save to journal"}
              </button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}

function VoicePanel(props: GuideProps & { onSaved: (conversationId: string | null) => void }) {
  const [savedId, setSavedId] = useState<string | null>(null);
  const voice = useGeminiVoice({ onEnded: (r) => setSavedId(r.conversationId) });
  const transcriptRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [voice.turns]);

  const live = voice.status === "live";
  const micOpen = live || voice.status === "checking" || voice.status === "starting";
  const presence: PresenceState = useMemo(() => {
    if (voice.status === "starting") return "connecting";
    if (!live) return "idle";
    return voice.speaking ? "speaking" : "listening";
  }, [voice.status, live, voice.speaking]);
  const canStart = props.capabilities.voice && props.voice.remainingSeconds >= 30;

  const statusText =
    voice.status === "starting"
      ? "Connecting to Sophia…"
      : live
        ? voice.speaking
          ? "Sophia is speaking"
          : voice.hearing
            ? "Sophia hears you…"
            : "Sophia is listening. Speak whenever you're ready."
        : voice.status === "checking"
          ? voice.hearing
            ? "Your microphone is working."
            : "Say something to test your microphone."
          : voice.status === "ending"
            ? "Saving your conversation…"
            : "Speak with Sophia";

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 pb-6 pt-4 text-center sm:pt-8">
        <Presence state={presence} levelRef={voice.levelRef} className="w-52 sm:w-64" />
        <p className="font-display mt-4 text-3xl text-ink sm:text-4xl" aria-live="polite">
          {statusText}
        </p>
        {live ? (
          <p className="mt-2 font-mono text-xs tabular-nums text-muted" aria-label="Time remaining">
            {clock(voice.secondsLeft)} left in this session
          </p>
        ) : (
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
            A live, spoken conversation. {minutes(props.voice.remainingSeconds)} of voice time left today; transcripts are saved to your
            conversations.
          </p>
        )}

        {/* Microphone */}
        <div className="mt-7 w-full max-w-md rounded-[1.4rem] border border-line bg-surface p-4 text-left shadow-soft">
          <div className="flex items-center gap-3">
            <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", micOpen ? "bg-moss-soft text-moss" : "bg-surface-2 text-muted")}>
              {voice.micMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted">Your microphone</p>
              {voice.devices.length > 1 ? (
                <select
                  value={voice.deviceId}
                  onChange={(e) => void voice.switchDevice(e.target.value)}
                  className="mt-0.5 w-full truncate bg-transparent text-sm font-medium text-ink focus:outline-none"
                  aria-label="Choose microphone"
                >
                  {voice.devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-0.5 truncate text-sm font-medium text-ink">{voice.deviceLabel || "Not connected yet"}</p>
              )}
            </div>
            <span className={cn("size-2 shrink-0 rounded-full transition-colors", voice.hearing ? "bg-moss shadow-[0_0_10px_2px_rgb(63_97_80/0.45)]" : "bg-line-strong")} />
          </div>
          <MicMeter levelRef={voice.micLevelRef} active={micOpen} className="mt-3 justify-center" />
          {voice.micMuted ? <p className="mt-2 text-xs text-rose">Your microphone is muted at the system or hardware level.</p> : null}
        </div>

        {voice.micSilent && micOpen ? (
          <Notice tone="gold" className="mt-4 max-w-md text-left" title="Sophia can't hear anything from this microphone">
            It&rsquo;s sending complete silence. Choose another input above, check it isn&rsquo;t muted, and make sure Windows allows
            apps to use it (Settings › Privacy &amp; security › Microphone).
          </Notice>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {live || voice.status === "starting" ? (
            <Button variant="secondary" size="lg" onClick={() => void voice.end()} disabled={voice.status === "starting"}>
              <Square className="size-3.5" /> End session
            </Button>
          ) : (
            <>
              <Button size="lg" onClick={() => void voice.start()} disabled={!canStart || voice.status === "ending"}>
                <Mic className="size-4" /> {voice.status === "ended" ? "Start another session" : "Start speaking"}
              </Button>
              {voice.status === "checking" ? (
                <Button size="lg" variant="secondary" onClick={() => voice.stopCheck()}>
                  Stop test
                </Button>
              ) : (
                <Button size="lg" variant="secondary" onClick={() => void voice.checkMic()} disabled={voice.status === "ending"}>
                  Test microphone
                </Button>
              )}
            </>
          )}
        </div>

        <div className="mt-5 w-full max-w-md space-y-3 text-left">
          {!props.capabilities.voice ? <Notice tone="gold">Voice isn&rsquo;t configured on this server (GEMINI_API_KEY).</Notice> : null}
          {props.capabilities.voice && props.voice.remainingSeconds < 30 ? (
            <Notice tone="gold">
              You&rsquo;ve used today&rsquo;s voice time. It refreshes over the next 24 hours.
              {props.plan === "seeker" ? (
                <>
                  {" "}
                  <Link href="/membership" className="font-medium underline underline-offset-4">
                    Initiate includes an hour a day.
                  </Link>
                </>
              ) : null}
            </Notice>
          ) : null}
          {voice.error ? <Notice tone="rose">{voice.error.message}</Notice> : null}
          {voice.status === "ended" && savedId ? (
            <Notice tone="sage">
              Your conversation was saved.{" "}
              <button className="font-medium underline underline-offset-4" onClick={() => props.onSaved(savedId)}>
                Read the transcript
              </button>
            </Notice>
          ) : null}
          {voice.status === "idle" ? (
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
              <Headphones className="size-3.5" /> Headphones give the clearest conversation.
            </p>
          ) : null}
        </div>

        {voice.turns.length ? (
          <div ref={transcriptRef} className="mt-8 w-full max-w-2xl rounded-[1.4rem] border border-line bg-surface/60 p-5 text-left" aria-label="Live transcript">
            <ol className="space-y-4">
              {voice.turns.map((t, i) => (
                <li key={i} className={cn("flex", t.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[85%] text-[0.97rem] leading-relaxed", t.role === "user" ? "rounded-2xl rounded-br-md bg-moss-soft px-4 py-2.5 text-ink" : "text-ink")}>
                    <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted">{t.role === "user" ? "You" : "Sophia"}</span>
                    {t.text}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function VideoPanel(props: GuideProps) {
  const [state, setState] = useState<"idle" | "starting" | "live" | "ending" | "ended">("idle");
  const [session, setSession] = useState<{ sessionId: string; url: string; maxSeconds: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (state !== "live" || !session) return;
    const deadline = Date.now() + session.maxSeconds * 1000;
    const t = setInterval(() => {
      const l = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setLeft(l);
      if (l <= 0) void stop();
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, session]);

  async function startVideo() {
    setError(null);
    setState("starting");
    const res = await fetch("/api/guide/video/session", { method: "POST" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Couldn't start the session.");
      setState("idle");
      return;
    }
    setSession(json);
    setLeft(json.maxSeconds);
    setState("live");
  }

  async function stop() {
    if (!session) return;
    setState("ending");
    await fetch(`/api/guide/live/${session.sessionId}/end`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
    setSession(null);
    setState("ended");
  }

  const intro = (title: React.ReactNode, body: React.ReactNode, action?: React.ReactNode) => (
    <div className="flex flex-1 flex-col items-center justify-center px-4 pb-10 text-center">
      <Presence state={state === "starting" ? "connecting" : "idle"} className="w-48" />
      <h2 className="font-display mt-6 text-5xl">{title}</h2>
      <div className="mt-3 max-w-md text-[1.02rem] leading-relaxed text-muted">{body}</div>
      {error ? (
        <Notice tone="rose" className="mt-5 max-w-md">
          {error}
        </Notice>
      ) : null}
      {state === "ended" ? (
        <Notice tone="sage" className="mt-5">
          Session ended. Thank you for your time together.
        </Notice>
      ) : null}
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  );

  if (props.plan === "seeker") {
    return intro(
      <>
        Face to face <em>with Sophia</em>
      </>,
      "A live video conversation with Sophia. It's part of the Initiate plan, alongside deeper guidance that remembers your path. Writing and speaking remain open to you as a Seeker.",
      <LinkButton href="/membership" variant="secondary">
        About the Initiate plan
      </LinkButton>,
    );
  }
  if (!props.capabilities.video) {
    return intro("Face to face is being prepared", "Sophia's video presence hasn't been set up on this server yet. Voice sessions offer a live, spoken conversation in the meantime.");
  }
  if (state === "live" && session) {
    return (
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 py-6">
        <div className="w-full max-w-5xl">
          <div className="aspect-video overflow-hidden rounded-[1.75rem] border border-line bg-night shadow-lift">
            <iframe src={session.url} title="Video conversation with Sophia" allow="camera; microphone; autoplay; fullscreen; display-capture" className="size-full" />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="font-mono text-xs tabular-nums text-muted">{clock(left)} left</p>
            <Button variant="secondary" onClick={() => void stop()}>
              <Square className="size-3.5" /> End session
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return intro(
    <>
      Face to face <em>with Sophia</em>
    </>,
    `A live video conversation. ${minutes(props.video.remainingSeconds)} left this month; sessions last up to 15 minutes. Your camera is optional.`,
    <Button size="lg" onClick={() => void startVideo()} disabled={state === "starting" || props.video.remainingSeconds < 60}>
      <Video className="size-4" /> {state === "starting" ? "Starting…" : "Begin session"}
    </Button>,
  );
}
