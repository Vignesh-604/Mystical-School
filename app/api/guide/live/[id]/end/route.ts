import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth/session";
import { addMessage, createConversation } from "@/lib/guide/store";
import { jsonError, sameOrigin } from "@/lib/http";
import { attachConversation, endLiveSession } from "@/lib/live";
import { voiceAllowance } from "@/lib/membership";
import { endTavusConversation } from "@/lib/video/tavus";

export const runtime = "nodejs";

const bodySchema = z.object({
  transcript: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(4000) }))
    .max(400)
    .optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return jsonError(403, "Cross-site request refused.");
  const user = await currentUser();
  if (!user) return jsonError(401, "Please sign in.");
  const { id } = await ctx.params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError(400, "Invalid transcript.");

  const session = endLiveSession(id, user.id);
  if (!session) return jsonError(404, "Session not found.");
  if (session.kind === "video" && session.providerRef) await endTavusConversation(session.providerRef);

  // Keep the voice transcript as a conversation the member can revisit or delete.
  let conversationId = session.conversationId ?? null;
  const turns = (parsed.data.transcript ?? []).map((t) => ({ ...t, text: t.text.trim() })).filter((t) => t.text);
  if (!conversationId && turns.length) {
    const firstUser = turns.find((t) => t.role === "user")?.text ?? "Voice conversation";
    conversationId = createConversation(user.id, firstUser, session.kind);
    for (const t of turns) addMessage(conversationId, t.role, t.text);
    attachConversation(id, conversationId);
  }

  return NextResponse.json({
    ok: true,
    chargedSeconds: session.chargedSeconds ?? 0,
    conversationId,
    voiceRemaining: voiceAllowance(user.id).remaining,
  });
}
