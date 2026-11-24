"use client";

import {
  ArrowUp,
  BookmarkPlus,
  Check,
  Headphones,
  Lock,
  MessageSquareText,
  Mic,
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

function fmtMinutes(s: number) {
  const m = Math.floor(s / 60);
  return `${m} min`;
}

function clock(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    const userMsg: Msg = { id: `local-${Date.now()}`, role: "user", content: message };
    const replyId = `reply-${Date.now()}`;
    setMessages((m) => [...m, userMsg, { id: replyId, role: "assistant", content: "", pending: true }]);
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
  const empty = messages.length === 0;

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-7xl">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-16 left-0 z-30 w-72 shrink-0 border-r border-line bg-bg p-4 transition-transform md:relative md:inset-auto md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Conversations"
      >
        <div className="flex items-center justify-between md:hidden">
          <span className="text-sm font-medium">Conversations</span>
          <button onClick={() => setSidebarOpen(false)} aria-label="Close conversations" className="rounded-full p-2 hover:bg-surface-2">
            <X className="size-4" />
          </button>
        </div>
        <Link
          href="/guide?new=1"
          onClick={() => {
            setSidebarOpen(false);
            setMode("text");
          }}
          className="mt-2 flex items-center gap-2 rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface-2 md:mt-0"
        >
          <Plus className="size-4" /> New conversation
        </Link>
        <nav className="mt-4 h-[calc(100%-7.5rem)] overflow-y-auto pr-1">
          {props.conversations.length === 0 ? (
            <p className="px-2 py-4 text-sm text-muted">Your conversations with Sophia will appear here.</p>
          ) : (
            <ul className="space-y-0.5">
              {props.conversations.map((c) => (
                <li key={c.id} className="group relative">
                  <Link
                    href={`/guide?c=${c.id}`}
                    onClick={() => {
                      setSidebarOpen(false);
                      setMode("text");
                    }}
                    className={cn(
                      "flex items-start gap-2 rounded-lg px-2.5 py-2 pr-8 text-sm",
                      c.id === conversationId ? "bg-surface-2 text-ink" : "text-ink-2 hover:bg-surface-2/60",
                    )}
                  >
                    {c.mode === "voice" ? (
                      <Mic className="mt-0.5 size-3.5 shrink-0 text-muted" />
                    ) : (
                      <MessageSquareText className="mt-0.5 size-3.5 shrink-0 text-muted" />
                    )}
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
                    className="absolute right-1.5 top-2 hidden rounded-md p-1 text-muted hover:bg-bg hover:text-rose group-hover:block focus:block"
                    aria-label={`Delete conversation ${c.title}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>
        <div className="absolute inset-x-4 bottom-4 border-t border-line pt-3 text-sm">
          <Link href="/journal" className="text-muted hover:text-ink">
            Your journal
          </Link>
          <span className="mx-2 text-line-strong">·</span>
          <Link href="/about-sophia" className="text-muted hover:text-ink">
            How Sophia works
          </Link>
        </div>
      </aside>
      {sidebarOpen ? <div className="fixed inset-0 top-16 z-20 bg-ink/20 md:hidden" onClick={() => setSidebarOpen(false)} /> : null}

      {/* Main */}
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 sm:px-6">
          <button
            className="rounded-full p-2 text-muted hover:bg-surface-2 md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show conversations"
          >
            <PanelLeft className="size-4" />
          </button>
          <div role="tablist" aria-label="How to talk with Sophia" className="flex rounded-full bg-surface-2 p-1">
            {(
              [
                ["text", "Text", MessageSquareText],
                ["voice", "Voice", Mic],
                ["video", "Face to face", Video],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                role="tab"
                aria-selected={mode === key}
                onClick={() => setMode(key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
                  mode === key ? "bg-surface text-ink shadow-soft" : "text-muted hover:text-ink",
                )}
              >
                <Icon className="size-3.5" />
                <span className={key === "video" ? "hidden sm:inline" : ""}>{label}</span>
                {key === "video" && props.plan === "seeker" ? <Lock className="size-3 text-muted" /> : null}
              </button>
            ))}
          </div>
          <p className="ml-auto hidden text-xs text-muted sm:block">
            {mode === "text"
              ? `${remaining} of ${props.chat.limit} messages left today`
              : mode === "voice"
                ? `${fmtMinutes(props.voice.remainingSeconds)} of voice left today`
                : props.plan === "initiate"
                  ? `${fmtMinutes(props.video.remainingSeconds)} left this month`
                  : "Initiate plan"}
          </p>
        </div>

        {mode === "text" ? (
          <>
            <div ref={listRef} className="flex-1 overflow-y-auto px-4 sm:px-6" aria-live="polite">
              {empty ? (
                <div className="mx-auto flex max-w-2xl flex-col items-center py-12 text-center sm:py-16">
                  <Presence state="idle" className="w-40 sm:w-48" />
                  <h1 className="font-display mt-6 text-4xl font-semibold text-ink">Hello, {props.firstName}.</h1>
                  <p className="mt-2 max-w-md text-muted">
                    I&rsquo;m Sophia, the school&rsquo;s AI guide. What would you like to explore today?
                  </p>
                  <div className="mt-8 grid w-full gap-2 sm:grid-cols-2">
                    {props.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => void send(s)}
                        disabled={limitReached || !props.capabilities.text}
                        className="rounded-xl border border-line bg-surface px-4 py-3 text-left text-sm text-ink-2 transition-colors hover:border-gold/50 hover:text-ink disabled:opacity-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <ol className="mx-auto max-w-3xl space-y-6 py-8">
                  {messages.map((m) => (
                    <MessageRow key={m.id} msg={m} />
                  ))}
                </ol>
              )}
            </div>

            <div className="border-t border-line bg-bg px-4 pb-4 pt-3 sm:px-6">
              <div className="mx-auto max-w-3xl space-y-3">
                {safety ? (
                  <div className="rounded-xl border border-rose/30 bg-rose-soft/60 px-4 py-3 text-sm" role="alert">
                    <p className="font-medium text-ink">{safety.title}</p>
                    <ul className="mt-1.5 list-disc space-y-1 pl-5 text-ink-2">
                      {safety.lines.map((l) => (
                        <li key={l}>{l}</li>
                      ))}
                    </ul>
                    <Link href="/support" className="mt-2 inline-block font-medium text-ink underline underline-offset-4">
                      More support options
                    </Link>
                  </div>
                ) : null}
                {!props.capabilities.text ? (
                  <Notice tone="gold">Text guidance isn&rsquo;t configured on this server (OPENROUTER_API_KEY).</Notice>
                ) : null}
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
                  className="flex items-end gap-2 rounded-2xl border border-line-strong bg-surface p-2 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/15"
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
                    className="field-sizing-content max-h-48 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[0.98rem] text-ink placeholder:text-muted/70 focus:outline-none disabled:opacity-60"
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
                      className="inline-flex size-10 items-center justify-center rounded-full bg-ink text-bg transition-opacity disabled:opacity-30"
                    >
                      <ArrowUp className="size-4" />
                    </button>
                  )}
                </form>
                <p className="text-center text-xs text-muted">
                  Sophia is an AI and can be wrong. She&rsquo;s not a substitute for medical or mental-health care.
                </p>
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
      <li className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-[0.98rem] leading-relaxed text-bg">
          {msg.content}
        </div>
      </li>
    );
  }
  return (
    <li className="group flex gap-3">
      <div className="mt-1 size-7 shrink-0">
        <Presence state={msg.pending ? "thinking" : "idle"} className="size-7" />
      </div>
      <div className="min-w-0 flex-1">
        {msg.pending ? (
          <div className="flex h-7 items-center gap-1" aria-label="Sophia is reflecting">
            <span className="typing-dot size-1.5 rounded-full bg-muted" />
            <span className="typing-dot size-1.5 rounded-full bg-muted" />
            <span className="typing-dot size-1.5 rounded-full bg-muted" />
          </div>
        ) : (
          <>
            <Markdown text={msg.content} className="prose-chat text-ink" />
            {!msg.id.startsWith("reply-") || msg.content ? (
              <div className="mt-2 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                <button
                  disabled={saved}
                  onClick={async () => {
                    const firstLine = msg.content.replace(/[*_#>]/g, "").split(/[.\n]/)[0]?.trim().slice(0, 80) || "From Sophia";
                    const res = await saveToJournalAction({ title: firstLine, body: msg.content, kind: "insight", source: "guide" });
                    if (res.ok) setSaved(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted hover:bg-surface-2 hover:text-ink disabled:text-sage"
                >
                  {saved ? <Check className="size-3.5" /> : <BookmarkPlus className="size-3.5" />}
                  {saved ? "Saved to journal" : "Save to journal"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </li>
  );
}

function VoicePanel(props: GuideProps & { onSaved: (conversationId: string | null) => void }) {
  const [savedId, setSavedId] = useState<string | null | undefined>(undefined);
  const voice = useGeminiVoice({ onEnded: (r) => setSavedId(r.conversationId) });
  const transcriptRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight });
  }, [voice.turns]);

  const presence: PresenceState = useMemo(() => {
    if (voice.status === "starting") return "connecting";
    if (voice.status !== "live") return "idle";
    return voice.speaking ? "speaking" : "listening";
  }, [voice.status, voice.speaking]);

  const canStart = props.capabilities.voice && props.voice.remainingSeconds >= 30;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-col items-center px-4 pt-8 text-center sm:pt-12">
        <Presence state={presence} levelRef={voice.levelRef} className="w-48 sm:w-60" />
        <p className="mt-5 text-sm font-medium text-ink" aria-live="polite">
          {voice.status === "starting"
            ? "Connecting…"
            : voice.status === "live"
              ? voice.speaking
                ? "Sophia is speaking"
                : voice.userActive
                  ? "Listening…"
                  : "Sophia is listening. Speak whenever you're ready."
              : voice.status === "ending"
                ? "Saving your conversation…"
                : "Speak with Sophia"}
        </p>
        {voice.status === "live" ? (
          <p className="mt-1 font-mono text-xs text-muted" aria-label="Time remaining">
            {clock(voice.secondsLeft)} left in this session
          </p>
        ) : (
          <p className="mt-1 max-w-md text-sm text-muted">
            A live, spoken conversation. {fmtMinutes(props.voice.remainingSeconds)} of voice time left today. Transcripts are saved to
            your conversations.
          </p>
        )}

        <div className="mt-6 flex gap-2">
          {voice.status === "live" || voice.status === "starting" ? (
            <Button variant="secondary" onClick={() => void voice.end()} disabled={voice.status === "starting"}>
              <Square className="size-3.5" /> End session
            </Button>
          ) : (
            <Button onClick={() => void voice.start()} disabled={!canStart || voice.status === "ending"}>
              <Mic className="size-4" /> {voice.status === "ended" ? "Start another session" : "Start speaking"}
            </Button>
          )}
        </div>

        <div className="mt-4 max-w-md space-y-3">
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
      </div>

      {voice.turns.length ? (
        <div ref={transcriptRef} className="mx-auto mt-6 w-full max-w-2xl flex-1 overflow-y-auto px-4 pb-6" aria-label="Live transcript">
          <ol className="space-y-3">
            {voice.turns.map((t, i) => (
              <li key={i} className={cn("text-[0.95rem] leading-relaxed", t.role === "user" ? "text-right text-ink-2" : "text-ink")}>
                <span className="mb-0.5 block text-xs uppercase tracking-wider text-muted">{t.role === "user" ? "You" : "Sophia"}</span>
                {t.text}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
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

  if (props.plan === "seeker") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <Presence state="idle" className="w-40" />
        <h2 className="font-display mt-6 text-3xl font-semibold">Face to face with Sophia</h2>
        <p className="mt-2 max-w-md text-muted">
          A live video conversation with Sophia&rsquo;s avatar. It&rsquo;s part of the Initiate plan, alongside deeper guidance that
          remembers your path. Text and voice remain open to you as a Seeker.
        </p>
        <LinkButton href="/membership" variant="secondary" className="mt-6">
          About the Initiate plan
        </LinkButton>
      </div>
    );
  }

  if (!props.capabilities.video) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <Presence state="idle" className="w-40" />
        <h2 className="font-display mt-6 text-3xl font-semibold">Face to face is being prepared</h2>
        <p className="mt-2 max-w-md text-muted">
          Sophia&rsquo;s video avatar hasn&rsquo;t been set up on this server yet. In the meantime, voice sessions offer a live,
          spoken conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 py-8">
      {state === "live" && session ? (
        <div className="w-full max-w-4xl">
          <div className="aspect-video overflow-hidden rounded-2xl border border-line bg-black">
            <iframe
              src={session.url}
              title="Video conversation with Sophia"
              allow="camera; microphone; autoplay; fullscreen; display-capture"
              className="size-full"
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="font-mono text-xs text-muted">{clock(left)} left</p>
            <Button variant="secondary" onClick={() => void stop()}>
              <Square className="size-3.5" /> End session
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Presence state={state === "starting" ? "connecting" : "idle"} className="w-44" />
          <h2 className="font-display mt-6 text-3xl font-semibold">Face to face with Sophia</h2>
          <p className="mt-2 max-w-md text-muted">
            A live video conversation. {fmtMinutes(props.video.remainingSeconds)} left this month; sessions last up to 15 minutes.
            Your camera is optional.
          </p>
          {error ? <Notice tone="rose" className="mt-4 max-w-md">{error}</Notice> : null}
          {state === "ended" ? <Notice tone="sage" className="mt-4">Session ended. Thank you for your time together.</Notice> : null}
          <Button className="mt-6" onClick={() => void startVideo()} disabled={state === "starting" || props.video.remainingSeconds < 60}>
            <Video className="size-4" /> {state === "starting" ? "Starting…" : "Begin session"}
          </Button>
        </div>
      )}
    </div>
  );
}
