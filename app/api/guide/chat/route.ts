import { z } from "zod";
import { currentUser } from "@/lib/auth/session";
import { capabilities, env } from "@/lib/env";
import { refreshMemory } from "@/lib/guide/memory";
import { ProviderError, streamChat, type ChatMessage } from "@/lib/guide/openrouter";
import { buildSystemPrompt } from "@/lib/guide/prompt";
import { safetyInstruction, screenMessage } from "@/lib/guide/safety";
import { addMessage, conversationMessages, createConversation, ownedConversation, userMessageCount } from "@/lib/guide/store";
import { jsonError, sameOrigin } from "@/lib/http";
import { chatAllowance, limitsFor, recordUsage, refundUsage } from "@/lib/membership";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  conversationId: z.string().max(64).optional(),
  message: z.string().trim().min(1, "Write a message first.").max(4000, "That message is too long (4,000 characters at most)."),
});

const HISTORY_MESSAGES = 24;
const HISTORY_CHARS = 24_000;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return jsonError(403, "Cross-site request refused.");
  const user = await currentUser();
  if (!user) return jsonError(401, "Please sign in to talk with Sophia.");
  if (!capabilities().text) return jsonError(503, "Sophia's text guidance isn't configured on this server.");

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(400, parsed.error.issues[0]?.message ?? "Invalid request.");
  const { message } = parsed.data;

  const allowance = chatAllowance(user.id);
  if (allowance.remaining <= 0) {
    return jsonError(429, "You've reached today's messages for your plan.", { code: "limit", limit: allowance.limit });
  }

  let conversationId = parsed.data.conversationId;
  if (conversationId && !ownedConversation(user.id, conversationId)) return jsonError(404, "Conversation not found.");
  if (!conversationId) conversationId = createConversation(user.id, message);

  const flag = screenMessage(message);
  addMessage(conversationId, "user", message, flag);
  const usageId = recordUsage(user.id, "chat_message", 1);

  // Recent history, newest last, trimmed to a character budget.
  const history = conversationMessages(conversationId, HISTORY_MESSAGES);
  const trimmed: ChatMessage[] = [];
  let chars = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i]!;
    chars += m.content.length;
    if (chars > HISTORY_CHARS && trimmed.length > 0) break;
    trimmed.unshift({ role: m.role, content: m.content });
  }

  const limits = limitsFor(user.id);
  let system = buildSystemPrompt({ userId: user.id, name: user.name, mode: "text" });
  if (flag) system += `\n\n${safetyInstruction(flag)}`;
  const model = limits.model === "paid" ? env.guideModelPaid() : env.guideModelFree();

  const abort = new AbortController();
  req.signal.addEventListener("abort", () => abort.abort());
  const iterator = streamChat([{ role: "system", content: system }, ...trimmed], { model, signal: abort.signal });

  // Wait for the first token so provider errors become a clean JSON error.
  let first: IteratorResult<string>;
  try {
    first = await iterator.next();
  } catch (err) {
    refundUsage(usageId);
    const status = err instanceof ProviderError ? err.status : 502;
    console.error("[guide/chat] provider error", status, err instanceof Error ? err.message.slice(0, 200) : "");
    return jsonError(status === 429 ? 429 : 502, "Sophia couldn't answer just now. Please try again in a moment.", {
      conversationId,
    });
  }

  const encoder = new TextEncoder();
  const cid = conversationId;
  let full = first.done ? "" : first.value;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      if (full) controller.enqueue(encoder.encode(full));
    },
    async pull(controller) {
      try {
        const next = await iterator.next();
        if (!next.done) {
          full += next.value;
          controller.enqueue(encoder.encode(next.value));
          return;
        }
      } catch {
        const note = "\n\n_(Sophia's reply was interrupted. You can ask her to continue.)_";
        full += note;
        controller.enqueue(encoder.encode(note));
      }
      if (full.trim()) addMessage(cid, "assistant", full.trim());
      controller.close();
      if (limits.memory && userMessageCount(cid) % 4 === 0) {
        refreshMemory(user.id, cid).catch((e) => console.error("[guide/memory]", e instanceof Error ? e.message : e));
      }
    },
    cancel() {
      abort.abort();
      if (full.trim()) addMessage(cid, "assistant", full.trim());
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Conversation-Id": cid,
      "X-Safety-Flag": flag ?? "",
      "X-Remaining": String(Math.max(0, allowance.remaining - 1)),
    },
  });
}
