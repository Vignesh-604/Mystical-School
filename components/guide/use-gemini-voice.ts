"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceTurn = { role: "user" | "assistant"; text: string; final: boolean };
export type VoiceStatus = "idle" | "checking" | "starting" | "live" | "ending" | "ended" | "error";
export type MicDevice = { id: string; label: string };
type VoiceError = { message: string; code?: string };
type Saved = { conversationId: string | null; chargedSeconds: number };

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

/** Speech is above this RMS; a working but quiet room sits well below it. */
const SPEECH_RMS = 0.012;
/** Treat the input as dead if it has never moved above this in a few seconds. */
const DEAD_INPUT_RMS = 0.0015;

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

export function micErrorMessage(err: unknown): string {
  const name = err instanceof Error ? err.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Microphone access is blocked. Allow the microphone for this site in your browser (the icon to the left of the address bar). The Claude app's preview pane always blocks microphones, so open http://localhost:3000 in Chrome or Edge.";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") return "No microphone was found. Connect one, or choose another input.";
  if (name === "NotReadableError" || name === "AbortError") {
    return "The microphone is busy or blocked by the system. Close other apps using it, and check Windows Settings › Privacy & security › Microphone.";
  }
  return "Couldn't open your microphone. Check your browser and system microphone settings.";
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

async function saveSession(sessionId: string, transcript: { role: VoiceTurn["role"]; text: string }[]): Promise<Saved | null> {
  try {
    const res = await fetch(`/api/guide/live/${sessionId}/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
      keepalive: true,
    });
    if (res.ok) {
      const json = await res.json();
      return { conversationId: json.conversationId ?? null, chargedSeconds: json.chargedSeconds ?? 0 };
    }
  } catch {}
  return null;
}

export function useGeminiVoice(opts: { onEnded?: (r: Saved) => void } = {}) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error, setError] = useState<VoiceError | null>(null);
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [hearing, setHearing] = useState(false);
  const [micSilent, setMicSilent] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [devices, setDevices] = useState<MicDevice[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");
  const [deviceLabel, setDeviceLabel] = useState<string>("");
  /** Drives Sophia's presence: her voice while she speaks, yours while you do. */
  const levelRef = useRef(0);
  /** Your microphone level, 0–1, from the moment the mic opens. */
  const micLevelRef = useRef(0);

  const r = useRef({
    ctx: null as AudioContext | null,
    workletReady: false,
    out: null as GainNode | null,
    outAnalyser: null as AnalyserNode | null,
    mic: null as MediaStream | null,
    micNodes: [] as AudioNode[],
    micAnalyser: null as AnalyserNode | null,
    ws: null as WebSocket | null,
    sessionId: null as string | null,
    ready: false,
    running: false,
    ending: false,
    attempt: 0,
    turns: [] as VoiceTurn[],
    deadline: 0,
    raf: 0,
    timer: undefined as ReturnType<typeof setInterval> | undefined,
    handshake: undefined as ReturnType<typeof setTimeout> | undefined,
    nextTime: 0,
    sources: new Set<AudioBufferSourceNode>(),
    openedAt: 0,
    lastLoudAt: 0,
    peakRms: 0,
    lastChunkAt: 0,
    flags: { speaking: false, hearing: false, silent: false },
    deviceId: "",
  });
  const onEndedRef = useRef(opts.onEnded);
  onEndedRef.current = opts.onEnded;

  const publish = () => setTurns(r.current.turns.map((t) => ({ ...t })));

  function appendTurn(role: VoiceTurn["role"], text: string) {
    const list = r.current.turns;
    const last = list[list.length - 1];
    if (last && last.role === role && !last.final) last.text += text;
    else {
      if (last && !last.final) last.final = true;
      list.push({ role, text, final: false });
    }
    publish();
  }

  /** Must run synchronously inside the click handler so the browser lets audio start. */
  function ensureContext(): AudioContext {
    const s = r.current;
    if (!s.ctx || s.ctx.state === "closed") {
      s.ctx = new AudioContext();
      s.workletReady = false;
      s.out = null;
    }
    void s.ctx.resume().catch(() => {});
    if (!s.out) {
      const out = s.ctx.createGain();
      const analyser = s.ctx.createAnalyser();
      analyser.fftSize = 512;
      out.connect(analyser).connect(s.ctx.destination);
      s.out = out;
      s.outAnalyser = analyser;
    }
    return s.ctx;
  }

  function stopPlayback() {
    const s = r.current;
    s.sources.forEach((src) => {
      try {
        src.stop();
      } catch {}
    });
    s.sources.clear();
    if (s.ctx) s.nextTime = s.ctx.currentTime;
  }

  function playPcm(b64: string, mime = "audio/pcm;rate=24000") {
    const s = r.current;
    if (!s.ctx || !s.out) return;
    const rate = Number(/rate=(\d+)/.exec(mime)?.[1] ?? 24000);
    const bytes = fromBase64(b64);
    const pcm = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
    const buf = s.ctx.createBuffer(1, pcm.length, rate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) ch[i] = pcm[i]! / 0x8000;
    const src = s.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(s.out);
    const at = Math.max(s.ctx.currentTime + 0.02, s.nextTime);
    src.start(at);
    s.nextTime = at + buf.duration;
    s.sources.add(src);
    src.onended = () => s.sources.delete(src);
  }

  function setFlag(key: "speaking" | "hearing" | "silent", value: boolean) {
    const s = r.current;
    if (s.flags[key] === value) return;
    s.flags[key] = value;
    if (key === "speaking") setSpeaking(value);
    else if (key === "hearing") setHearing(value);
    else setMicSilent(value);
  }

  function startLoop() {
    const s = r.current;
    if (s.raf) return;
    const inBuf = new Float32Array(1024);
    const outBuf = new Float32Array(512);
    const loop = () => {
      const now = Date.now();
      let inRms = 0;
      if (s.micAnalyser) {
        s.micAnalyser.getFloatTimeDomainData(inBuf);
        let sum = 0;
        for (const v of inBuf) sum += v * v;
        inRms = Math.sqrt(sum / inBuf.length);
        s.peakRms = Math.max(s.peakRms, inRms);
        if (inRms > SPEECH_RMS) s.lastLoudAt = now;
      }
      micLevelRef.current = Math.min(1, inRms * 9);
      setFlag("hearing", now - s.lastLoudAt < 350);
      // A dead input (wrong device, OS privacy block) delivers near-perfect silence.
      const watching = s.micAnalyser && now - s.openedAt > 3500;
      setFlag("silent", Boolean(watching && s.peakRms < DEAD_INPUT_RMS));

      let outRms = 0;
      if (s.outAnalyser) {
        s.outAnalyser.getFloatTimeDomainData(outBuf);
        let sum = 0;
        for (const v of outBuf) sum += v * v;
        outRms = Math.sqrt(sum / outBuf.length);
      }
      const talking = Boolean(s.ctx && s.ctx.currentTime < s.nextTime - 0.03);
      setFlag("speaking", talking);
      levelRef.current = talking ? Math.min(1, outRms * 4) : micLevelRef.current * 0.7;
      s.raf = requestAnimationFrame(loop);
    };
    s.raf = requestAnimationFrame(loop);
  }

  function stopLoop() {
    const s = r.current;
    cancelAnimationFrame(s.raf);
    s.raf = 0;
    levelRef.current = 0;
    micLevelRef.current = 0;
    setFlag("speaking", false);
    setFlag("hearing", false);
    setFlag("silent", false);
  }

  function closeMic() {
    const s = r.current;
    s.micNodes.forEach((n) => {
      try {
        n.disconnect();
      } catch {}
    });
    s.micNodes = [];
    s.micAnalyser = null;
    s.mic?.getTracks().forEach((t) => {
      t.onended = null;
      t.stop();
    });
    s.mic = null;
  }

  async function refreshDevices() {
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices(
        list
          .filter((d) => d.kind === "audioinput" && d.deviceId !== "communications")
          .map((d) => ({ id: d.deviceId, label: d.label || "Microphone" })),
      );
    } catch {}
  }

  /** Opens (or re-opens) the microphone and wires it to the meter and the capture worklet. */
  async function openMic(id?: string) {
    const s = r.current;
    const ctx = ensureContext();
    if (!navigator.mediaDevices?.getUserMedia) throw Object.assign(new Error("insecure"), { name: "SecurityError" });
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: id && id !== "default" ? { exact: id } : undefined,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
    });
    closeMic();
    s.mic = stream;
    const track = stream.getAudioTracks()[0]!;
    setDeviceLabel(track.label || "Microphone");
    const settled = track.getSettings().deviceId ?? id ?? "";
    s.deviceId = settled;
    setDeviceId(settled);
    setMicMuted(track.muted);
    track.onmute = () => setMicMuted(true);
    track.onunmute = () => setMicMuted(false);
    track.onended = () => {
      if (s.running) void finish({ message: "The microphone disconnected. Check your input and start again.", code: "mic" });
    };

    if (!s.workletReady) {
      const url = URL.createObjectURL(new Blob([MIC_WORKLET], { type: "application/javascript" }));
      try {
        await ctx.audioWorklet.addModule(url);
        s.workletReady = true;
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    await ctx.resume();

    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    const node = new AudioWorkletNode(ctx, "mic-processor");
    const sink = ctx.createGain();
    sink.gain.value = 0;
    source.connect(analyser);
    source.connect(node);
    node.connect(sink).connect(ctx.destination);
    node.port.onmessage = (event: MessageEvent<Int16Array>) => {
      if (!s.ready || s.ws?.readyState !== WebSocket.OPEN) return;
      const chunk = event.data;
      s.lastChunkAt = Date.now();
      const bytes = new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
      s.ws.send(JSON.stringify({ realtimeInput: { audio: { data: toBase64(bytes), mimeType: "audio/pcm;rate=16000" } } }));
    };
    s.micNodes = [source, analyser, node, sink];
    s.micAnalyser = analyser;
    s.openedAt = Date.now();
    s.peakRms = 0;
    s.lastLoudAt = 0;
    void refreshDevices();
    startLoop();
  }

  const teardown = useCallback(() => {
    const s = r.current;
    clearInterval(s.timer);
    clearTimeout(s.handshake);
    try {
      s.ws?.close();
    } catch {}
    s.ws = null;
    s.ready = false;
    closeMic();
    stopPlayback();
    stopLoop();
    void s.ctx?.close().catch(() => {});
    s.ctx = null;
    s.out = null;
    s.outAnalyser = null;
    s.workletReady = false;
    setMicMuted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = useCallback(
    async (failure?: VoiceError) => {
      const s = r.current;
      if (!s.running || s.ending) return;
      s.ending = true;
      s.attempt += 1;
      const sessionId = s.sessionId;
      s.sessionId = null;
      if (failure) setError(failure);
      setStatus(sessionId ? "ending" : failure ? "error" : "ended");
      teardown();
      s.turns.forEach((t) => (t.final = true));
      publish();
      const transcript = s.turns
        .filter((t) => t.text.trim())
        .slice(0, 400)
        .map((t) => ({ role: t.role, text: t.text.trim().slice(0, 4000) }));
      const saved = sessionId ? await saveSession(sessionId, transcript) : null;
      if (sessionId && !saved && !failure) setError({ message: "The session ended, but the conversation could not be saved." });
      s.running = false;
      s.ending = false;
      setStatus(failure ? "error" : "ended");
      if (saved) onEndedRef.current?.(saved);
    },
    [teardown],
  );

  const end = useCallback(() => finish(), [finish]);

  /** Opens the mic and shows its level without starting a (billed) session. */
  const checkMic = useCallback(async () => {
    const s = r.current;
    if (s.running) return;
    ensureContext();
    setError(null);
    setStatus("checking");
    try {
      await openMic(s.deviceId || undefined);
    } catch (err) {
      teardown();
      setStatus("error");
      setError({ message: micErrorMessage(err), code: "mic" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teardown]);

  const stopCheck = useCallback(() => {
    if (r.current.running) return;
    teardown();
    setStatus("idle");
  }, [teardown]);

  const switchDevice = useCallback(async (id: string) => {
    const s = r.current;
    s.deviceId = id;
    setDeviceId(id);
    if (!s.mic) return;
    try {
      ensureContext();
      await openMic(id);
      setError(null);
    } catch (err) {
      setError({ message: micErrorMessage(err), code: "mic" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(async () => {
    const s = r.current;
    if (s.running) return;
    ensureContext(); // inside the click, before any await
    const attempt = ++s.attempt;
    const isCurrent = () => s.attempt === attempt;
    s.running = true;
    s.ending = false;
    s.turns = [];
    setError(null);
    setStatus("starting");
    publish();

    if (!s.mic) {
      try {
        await openMic(s.deviceId || undefined);
      } catch (err) {
        if (isCurrent()) await finish({ message: micErrorMessage(err), code: "mic" });
        return;
      }
    }
    if (!isCurrent()) return;

    let session: { sessionId: string; token: string; wsUrl: string; maxSeconds: number };
    try {
      const res = await fetch("/api/guide/voice/session", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw Object.assign(new Error(json.error ?? "Couldn't start the session."), { code: json.code });
      session = json;
    } catch (err) {
      if (isCurrent()) await finish({ message: err instanceof Error ? err.message : "Couldn't start the session.", code: (err as VoiceError)?.code });
      return;
    }
    if (!isCurrent()) {
      void saveSession(session.sessionId, []);
      return;
    }
    s.sessionId = session.sessionId;

    let ws: WebSocket;
    try {
      ws = new WebSocket(`${session.wsUrl}?access_token=${encodeURIComponent(session.token)}`);
    } catch {
      await finish({ message: "Sophia's voice connection could not open. Try again." });
      return;
    }
    ws.binaryType = "arraybuffer";
    s.ws = ws;
    s.handshake = setTimeout(() => void finish({ message: "Sophia's voice connection took too long to open. Try again." }), 12_000);
    ws.onopen = () => {
      if (isCurrent()) ws.send(JSON.stringify({ setup: {} }));
    };
    ws.onmessage = (ev) => {
      if (!isCurrent()) return;
      const text = typeof ev.data === "string" ? ev.data : new TextDecoder().decode(ev.data as ArrayBuffer);
      let msg: LiveMessage;
      try {
        msg = JSON.parse(text);
      } catch {
        return;
      }
      if (msg.setupComplete && !s.ready) {
        clearTimeout(s.handshake);
        s.ready = true;
        s.lastChunkAt = Date.now();
        s.deadline = Date.now() + session.maxSeconds * 1000;
        setSecondsLeft(session.maxSeconds);
        s.timer = setInterval(() => {
          const left = Math.max(0, Math.round((s.deadline - Date.now()) / 1000));
          setSecondsLeft(left);
          if (left <= 0) void end();
          else if (Date.now() - s.lastChunkAt > 5_000) {
            void finish({ message: "Microphone capture stopped. Start a new session to continue.", code: "mic" });
          }
        }, 1000);
        setStatus("live");
        ws.send(JSON.stringify({ realtimeInput: { text: "(Greet the member warmly by first name in one or two short sentences, then ask what they'd like to explore today.)" } }));
        return;
      }
      if (msg.goAway) {
        void finish({ message: "Sophia's voice session reached its limit. Start another to continue." });
        return;
      }
      const sc = msg.serverContent;
      if (!sc) return;
      if (sc.interrupted) stopPlayback();
      if (sc.inputTranscription?.text) appendTurn("user", sc.inputTranscription.text);
      if (sc.outputTranscription?.text) appendTurn("assistant", sc.outputTranscription.text);
      for (const part of sc.modelTurn?.parts ?? []) if (part.inlineData?.data) playPcm(part.inlineData.data, part.inlineData.mimeType);
      if (sc.turnComplete) {
        s.turns.forEach((t) => (t.final = true));
        publish();
      }
    };
    ws.onerror = () => {
      if (isCurrent()) void finish({ message: "The connection to Sophia was interrupted. Try again." });
    };
    ws.onclose = () => {
      if (isCurrent()) void finish({ message: "Sophia's voice connection closed unexpectedly. Try again." });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end, finish]);

  // End the session (and release the mic) if the member leaves the page.
  useEffect(() => {
    const onHide = () => {
      if (r.current.running) void end();
      else teardown();
    };
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      onHide();
    };
  }, [end, teardown]);

  return {
    status,
    error,
    turns,
    speaking,
    hearing,
    micSilent,
    micMuted,
    secondsLeft,
    devices,
    deviceId,
    deviceLabel,
    levelRef,
    micLevelRef,
    start,
    end,
    checkMic,
    stopCheck,
    switchDevice,
  };
}
