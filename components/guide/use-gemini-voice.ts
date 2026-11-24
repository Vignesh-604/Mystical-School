"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceTurn = { role: "user" | "assistant"; text: string; final: boolean };
export type VoiceStatus = "idle" | "starting" | "live" | "ending" | "ended" | "error";

// Captures mic audio at the device rate and downsamples to 16 kHz PCM16 in ~100 ms chunks.
const MIC_WORKLET = `
class MicProcessor extends AudioWorkletProcessor {
  constructor() { super(); this.ratio = sampleRate / 16000; this.pos = 0; this.acc = 0; this.cnt = 0; this.out = new Int16Array(1600); this.n = 0; }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch) return true;
    for (let k = 0; k < ch.length; k++) {
      this.acc += ch[k]; this.cnt++; this.pos += 1;
      if (this.pos >= this.ratio) {
        this.pos -= this.ratio;
        const s = Math.max(-1, Math.min(1, this.acc / this.cnt));
        this.acc = 0; this.cnt = 0;
        this.out[this.n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
        if (this.n === this.out.length) { this.port.postMessage(this.out.slice(0)); this.n = 0; }
      }
    }
    return true;
  }
}
registerProcessor("mic-processor", MicProcessor);
`;

function toBase64(bytes: Uint8Array) {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

function fromBase64(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

type LiveMessage = {
  setupComplete?: unknown;
  goAway?: unknown;
  serverContent?: {
    modelTurn?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] };
    inputTranscription?: { text?: string };
    outputTranscription?: { text?: string };
    interrupted?: boolean;
    turnComplete?: boolean;
  };
};

export function useGeminiVoice(opts: { onEnded?: (r: { conversationId: string | null; chargedSeconds: number }) => void } = {}) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [userActive, setUserActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const levelRef = useRef(0);

  const r = useRef({
    ws: null as WebSocket | null,
    mic: null as MediaStream | null,
    micCtx: null as AudioContext | null,
    playCtx: null as AudioContext | null,
    analyser: null as AnalyserNode | null,
    out: null as GainNode | null,
    nextTime: 0,
    sources: new Set<AudioBufferSourceNode>(),
    sessionId: null as string | null,
    ready: false,
    ending: false,
    turns: [] as VoiceTurn[],
    deadline: 0,
    raf: 0,
    timer: 0 as unknown as ReturnType<typeof setInterval>,
    userLevelAt: 0,
  });
  const onEndedRef = useRef(opts.onEnded);
  onEndedRef.current = opts.onEnded;

  const publish = () => setTurns(r.current.turns.map((t) => ({ ...t })));

  function appendTurn(role: "user" | "assistant", text: string) {
    const list = r.current.turns;
    const last = list[list.length - 1];
    if (last && last.role === role && !last.final) last.text += text;
    else {
      if (last && !last.final) last.final = true;
      list.push({ role, text, final: false });
    }
    publish();
  }

  function finalizeAll() {
    r.current.turns.forEach((t) => (t.final = true));
    publish();
  }

  function stopPlayback() {
    r.current.sources.forEach((s) => {
      try {
        s.stop();
      } catch {}
    });
    r.current.sources.clear();
    if (r.current.playCtx) r.current.nextTime = r.current.playCtx.currentTime;
  }

  function playPcm(b64: string, mime = "audio/pcm;rate=24000") {
    const ctx = r.current.playCtx;
    if (!ctx || !r.current.out) return;
    const rate = Number(/rate=(\d+)/.exec(mime)?.[1] ?? 24000);
    const bytes = fromBase64(b64);
    const pcm = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
    const buf = ctx.createBuffer(1, pcm.length, rate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) ch[i] = pcm[i]! / 0x8000;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(r.current.out);
    const at = Math.max(ctx.currentTime + 0.02, r.current.nextTime);
    src.start(at);
    r.current.nextTime = at + buf.duration;
    r.current.sources.add(src);
    src.onended = () => r.current.sources.delete(src);
  }

  const teardown = useCallback(() => {
    const s = r.current;
    cancelAnimationFrame(s.raf);
    clearInterval(s.timer);
    try {
      s.ws?.close();
    } catch {}
    s.ws = null;
    s.mic?.getTracks().forEach((t) => t.stop());
    s.mic = null;
    stopPlayback();
    void s.micCtx?.close().catch(() => {});
    void s.playCtx?.close().catch(() => {});
    s.micCtx = null;
    s.playCtx = null;
    s.ready = false;
    levelRef.current = 0;
    setSpeaking(false);
    setUserActive(false);
  }, []);

  const end = useCallback(async () => {
    const s = r.current;
    if (s.ending || !s.sessionId) return;
    s.ending = true;
    setStatus("ending");
    teardown();
    finalizeAll();
    const transcript = s.turns.filter((t) => t.text.trim()).map((t) => ({ role: t.role, text: t.text.trim().slice(0, 4000) }));
    let result = { conversationId: null as string | null, chargedSeconds: 0 };
    try {
      const res = await fetch(`/api/guide/live/${s.sessionId}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
        keepalive: true,
      });
      const json = await res.json();
      if (res.ok) result = { conversationId: json.conversationId ?? null, chargedSeconds: json.chargedSeconds ?? 0 };
    } catch {
      // The server also closes stale sessions on the next start.
    }
    s.sessionId = null;
    setStatus("ended");
    onEndedRef.current?.(result);
  }, [teardown]);

  const start = useCallback(async () => {
    const s = r.current;
    if (status === "starting" || status === "live") return;
    setError(null);
    setStatus("starting");
    s.turns = [];
    s.ending = false;
    publish();

    // Ask for the microphone first, so a refusal never starts a billed session.
    try {
      s.mic = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      });
    } catch {
      setStatus("error");
      setError({ message: "Sophia needs your microphone to hear you. Please allow microphone access in your browser and try again.", code: "mic" });
      return;
    }

    let session: { sessionId: string; token: string; wsUrl: string; maxSeconds: number };
    try {
      const res = await fetch("/api/guide/voice/session", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw Object.assign(new Error(json.error ?? "Couldn't start the session."), { code: json.code });
      session = json;
    } catch (err) {
      teardown();
      setStatus("error");
      setError({ message: err instanceof Error ? err.message : "Couldn't start the session.", code: (err as { code?: string }).code });
      return;
    }
    s.sessionId = session.sessionId;

    // Audio output with a level meter for Sophia's presence.
    const playCtx = new AudioContext();
    const out = playCtx.createGain();
    const analyser = playCtx.createAnalyser();
    analyser.fftSize = 512;
    out.connect(analyser);
    analyser.connect(playCtx.destination);
    s.playCtx = playCtx;
    s.out = out;
    s.analyser = analyser;
    s.nextTime = 0;
    const meter = new Float32Array(analyser.fftSize);
    const loop = () => {
      analyser.getFloatTimeDomainData(meter);
      let sum = 0;
      for (const v of meter) sum += v * v;
      const rms = Math.sqrt(sum / meter.length);
      const talking = playCtx.currentTime < s.nextTime - 0.03;
      levelRef.current = talking ? Math.min(1, rms * 4) : Math.min(0.4, Math.max(0, (Date.now() - s.userLevelAt < 250 ? 0.25 : 0)));
      setSpeaking((prev) => (prev !== talking ? talking : prev));
      setUserActive((prev) => {
        const active = Date.now() - s.userLevelAt < 400;
        return prev !== active ? active : prev;
      });
      s.raf = requestAnimationFrame(loop);
    };
    s.raf = requestAnimationFrame(loop);

    // Microphone capture.
    const micCtx = new AudioContext();
    s.micCtx = micCtx;
    const workletUrl = URL.createObjectURL(new Blob([MIC_WORKLET], { type: "application/javascript" }));
    try {
      await micCtx.audioWorklet.addModule(workletUrl);
    } finally {
      URL.revokeObjectURL(workletUrl);
    }
    const source = micCtx.createMediaStreamSource(s.mic!);
    const node = new AudioWorkletNode(micCtx, "mic-processor");
    const silent = micCtx.createGain();
    silent.gain.value = 0;
    source.connect(node);
    node.connect(silent);
    silent.connect(micCtx.destination);
    node.port.onmessage = (e: MessageEvent<Int16Array>) => {
      const chunk = e.data;
      let sum = 0;
      for (let i = 0; i < chunk.length; i += 4) sum += (chunk[i]! / 0x8000) ** 2;
      if (Math.sqrt(sum / (chunk.length / 4)) > 0.02) s.userLevelAt = Date.now();
      if (s.ready && s.ws?.readyState === WebSocket.OPEN) {
        const bytes = new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
        s.ws.send(JSON.stringify({ realtimeInput: { audio: { data: toBase64(bytes), mimeType: "audio/pcm;rate=16000" } } }));
      }
    };

    // Connect to Gemini Live with the single-use token. The setup is locked server-side.
    const ws = new WebSocket(`${session.wsUrl}?access_token=${encodeURIComponent(session.token)}`);
    s.ws = ws;
    ws.onopen = () => ws.send(JSON.stringify({ setup: {} }));
    ws.onmessage = async (ev) => {
      const text = typeof ev.data === "string" ? ev.data : await (ev.data as Blob).text();
      let msg: LiveMessage;
      try {
        msg = JSON.parse(text);
      } catch {
        return;
      }
      if (msg.setupComplete) {
        s.ready = true;
        s.deadline = Date.now() + session.maxSeconds * 1000;
        setSecondsLeft(session.maxSeconds);
        s.timer = setInterval(() => {
          const left = Math.max(0, Math.round((s.deadline - Date.now()) / 1000));
          setSecondsLeft(left);
          if (left <= 0) void end();
        }, 1000);
        setStatus("live");
        ws.send(
          JSON.stringify({
            clientContent: {
              turns: [
                {
                  role: "user",
                  parts: [{ text: "(The member has just opened a voice session. Greet them warmly by first name in one or two short sentences and ask what they'd like to explore today.)" }],
                },
              ],
              turnComplete: true,
            },
          }),
        );
        return;
      }
      if (msg.goAway) {
        void end();
        return;
      }
      const sc = msg.serverContent;
      if (!sc) return;
      if (sc.interrupted) stopPlayback();
      if (sc.inputTranscription?.text) appendTurn("user", sc.inputTranscription.text);
      if (sc.outputTranscription?.text) appendTurn("assistant", sc.outputTranscription.text);
      for (const part of sc.modelTurn?.parts ?? []) {
        if (part.inlineData?.data) playPcm(part.inlineData.data, part.inlineData.mimeType);
      }
      if (sc.turnComplete) finalizeAll();
    };
    ws.onerror = () => {
      if (!s.ending) setError({ message: "The connection to Sophia was interrupted." });
    };
    ws.onclose = () => {
      if (!s.ending && s.sessionId) void end();
    };
  }, [status, end, teardown]);

  // End the session if the member leaves the page.
  useEffect(() => {
    const onHide = () => {
      if (r.current.sessionId && !r.current.ending) void end();
    };
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      onHide();
    };
  }, [end]);

  return { status, error, turns, speaking, userActive, secondsLeft, levelRef, start, end, reset: () => setStatus("idle") };
}
