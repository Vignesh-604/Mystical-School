import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/session";
import { capabilities } from "@/lib/env";
import { ProviderError } from "@/lib/guide/openrouter";
import { buildSystemPrompt } from "@/lib/guide/prompt";
import { jsonError, sameOrigin } from "@/lib/http";
import { closeOpenSessions, startLiveSession } from "@/lib/live";
import { voiceAllowance } from "@/lib/membership";
import { MAX_VOICE_SESSION_SECONDS } from "@/lib/plans";
import { mintLiveToken } from "@/lib/voice/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_SECONDS = 30;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return jsonError(403, "Cross-site request refused.");
  const user = await currentUser();
  if (!user) return jsonError(401, "Please sign in to talk with Sophia.");
  if (!capabilities().voice) return jsonError(503, "Voice sessions aren't configured on this server.");

  closeOpenSessions(user.id, "voice");
  const allowance = voiceAllowance(user.id);
  if (allowance.remaining < MIN_SECONDS) {
    return jsonError(429, "You've used today's voice time for your plan.", { code: "limit" });
  }
  const maxSeconds = Math.min(allowance.remaining, MAX_VOICE_SESSION_SECONDS);

  try {
    const { token, wsUrl } = await mintLiveToken({
      systemPrompt: buildSystemPrompt({ userId: user.id, name: user.name, mode: "voice" }),
      maxSeconds,
    });
    const sessionId = startLiveSession(user.id, "voice", maxSeconds);
    return NextResponse.json(
      { ok: true, sessionId, token, wsUrl, maxSeconds, firstName: user.name.split(" ")[0] },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[guide/voice] token error", err instanceof Error ? err.message.slice(0, 200) : err);
    return jsonError(err instanceof ProviderError && err.status === 503 ? 503 : 502, "Sophia's voice couldn't connect just now. Please try again.");
  }
}
