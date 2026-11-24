import { env } from "../env";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export class ProviderError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}

const URL = "https://openrouter.ai/api/v1/chat/completions";

function headers() {
  const key = env.openrouterKey();
  if (!key) throw new ProviderError("Text guidance isn't configured (OPENROUTER_API_KEY).", 503);
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    "HTTP-Referer": env.appUrl(),
    "X-Title": "Mystical School",
  };
}

/** Streams text deltas from OpenRouter (OpenAI-compatible SSE). */
export async function* streamChat(
  messages: ChatMessage[],
  opts: { model: string; maxTokens?: number; temperature?: number; signal?: AbortSignal },
): AsyncGenerator<string> {
  const res = await fetch(URL, {
    method: "POST",
    headers: headers(),
    signal: opts.signal,
    body: JSON.stringify({
      model: opts.model,
      messages,
      stream: true,
      max_tokens: opts.maxTokens ?? 900,
      temperature: opts.temperature ?? 0.7,
    }),
  });
  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new ProviderError(`Guide model request failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`, res.status === 429 ? 429 : 502);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith("data:")) continue; // comments such as ": OPENROUTER PROCESSING"
      const data = line.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data) as {
          choices?: { delta?: { content?: string } }[];
          error?: { message?: string };
        };
        if (json.error) throw new ProviderError(json.error.message ?? "Guide model error");
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch (err) {
        if (err instanceof ProviderError) throw err;
        // Ignore partial or keep-alive lines.
      }
    }
  }
}

/** Non-streaming completion for small utility tasks (memory notes). */
export async function complete(messages: ChatMessage[], opts: { model: string; maxTokens?: number }): Promise<string> {
  const res = await fetch(URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ model: opts.model, messages, max_tokens: opts.maxTokens ?? 400, temperature: 0.3 }),
  });
  if (!res.ok) throw new ProviderError(`Utility model request failed (${res.status})`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}
