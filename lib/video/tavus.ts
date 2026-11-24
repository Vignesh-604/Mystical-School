import { env } from "../env";
import { ProviderError } from "../guide/openrouter";

const API = "https://tavusapi.com/v2";

function headers() {
  const key = env.tavusKey();
  if (!key) throw new ProviderError("Video guidance isn't configured (TAVUS_API_KEY).", 503);
  return { "x-api-key": key, "Content-Type": "application/json" };
}

/** Starts a Tavus conversation with Sophia's persona. Billed per minute by Tavus. */
export async function createTavusConversation(opts: { context: string; greeting: string; maxSeconds: number }) {
  const personaId = env.tavusPersonaId();
  const replicaId = env.tavusReplicaId();
  if (!personaId || !replicaId) throw new ProviderError("The video guide needs a Sophia persona (MYSTICAL_TAVUS_PERSONA_ID).", 503);
  const res = await fetch(`${API}/conversations`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      replica_id: replicaId,
      persona_id: personaId,
      conversation_name: "Mystical School · Sophia",
      conversational_context: opts.context,
      custom_greeting: opts.greeting,
      properties: {
        max_call_duration: opts.maxSeconds,
        participant_left_timeout: 20,
        participant_absent_timeout: 90,
        enable_recording: false,
        language: "english",
      },
    }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    conversation_id?: string;
    conversation_url?: string;
    message?: string;
    error?: string;
  };
  if (!res.ok || !body.conversation_id || !body.conversation_url) {
    const reason = body.message || body.error || `status ${res.status}`;
    throw new ProviderError(
      res.status === 402 ? "The video guide's Tavus account is out of credit." : `Video session could not start (${reason.slice(0, 160)})`,
      res.status === 402 ? 402 : 502,
    );
  }
  return { conversationId: body.conversation_id, url: body.conversation_url };
}

export async function endTavusConversation(conversationId: string) {
  try {
    await fetch(`${API}/conversations/${encodeURIComponent(conversationId)}/end`, { method: "POST", headers: headers() });
  } catch (err) {
    // The session also ends itself at max_call_duration; log and move on.
    console.error("[tavus] end failed", err instanceof Error ? err.message : err);
  }
}
