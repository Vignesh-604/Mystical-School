import { env } from "../env";
import { ProviderError } from "../guide/openrouter";

const TOKENS_URL = "https://generativelanguage.googleapis.com/v1alpha/auth_tokens";
export const GEMINI_LIVE_WS =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained";

/**
 * Mints a single-use Gemini Live token with the whole session setup (model,
 * voice, Sophia's instructions) locked inside it. The browser connects with this
 * token and sends an empty setup, so it can neither see the API key nor change
 * the instructions.
 */
export async function mintLiveToken(opts: { systemPrompt: string; maxSeconds: number }) {
  const key = env.geminiKey();
  if (!key) throw new ProviderError("Voice guidance isn't configured (GEMINI_API_KEY).", 503);
  const now = Date.now();
  const model = `models/${env.geminiLiveModel()}`;
  const res = await fetch(`${TOKENS_URL}?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uses: 1,
      expireTime: new Date(now + (opts.maxSeconds + 120) * 1000).toISOString(),
      newSessionExpireTime: new Date(now + 90 * 1000).toISOString(),
      bidiGenerateContentSetup: {
        model,
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: env.geminiLiveVoice() } } },
        },
        systemInstruction: { parts: [{ text: opts.systemPrompt }] },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    }),
  });
  const body = (await res.json().catch(() => ({}))) as { name?: string; error?: { message?: string } };
  if (!res.ok || !body.name) {
    throw new ProviderError(`Voice session could not be created (${res.status})${body.error?.message ? `: ${body.error.message.slice(0, 160)}` : ""}`);
  }
  return { token: body.name, wsUrl: GEMINI_LIVE_WS, model };
}
