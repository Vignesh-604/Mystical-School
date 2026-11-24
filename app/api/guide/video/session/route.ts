import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/session";
import { capabilities } from "@/lib/env";
import { ProviderError } from "@/lib/guide/openrouter";
import { memberContext } from "@/lib/guide/prompt";
import { jsonError, sameOrigin } from "@/lib/http";
import { closeOpenSessions, startLiveSession } from "@/lib/live";
import { limitsFor, videoAllowance } from "@/lib/membership";
import { MAX_VIDEO_SESSION_SECONDS } from "@/lib/plans";
import { createTavusConversation } from "@/lib/video/tavus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return jsonError(403, "Cross-site request refused.");
  const user = await currentUser();
  if (!user) return jsonError(401, "Please sign in to talk with Sophia.");
  if (limitsFor(user.id).plan !== "initiate") return jsonError(403, "Face-to-face sessions are part of the Initiate plan.", { code: "plan" });
  if (!capabilities().video) return jsonError(503, "The face-to-face guide isn't set up on this server yet.", { code: "unconfigured" });

  closeOpenSessions(user.id, "video");
  const allowance = videoAllowance(user.id);
  if (allowance.remaining < 60) return jsonError(429, "You've used this month's face-to-face time.", { code: "limit" });
  const maxSeconds = Math.min(allowance.remaining, MAX_VIDEO_SESSION_SECONDS);

  try {
    const first = user.name.split(" ")[0];
    const { conversationId, url } = await createTavusConversation({
      context: `About the member you're speaking with (private; use naturally):\n${memberContext(user.id, user.name)}`,
      greeting: `Hello ${first}. It's good to see you. What's on your heart today?`,
      maxSeconds,
    });
    const sessionId = startLiveSession(user.id, "video", maxSeconds, conversationId);
    return NextResponse.json({ ok: true, sessionId, url, maxSeconds }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const status = err instanceof ProviderError ? err.status : 502;
    console.error("[guide/video] start error", status, err instanceof Error ? err.message.slice(0, 200) : err);
    return jsonError(status === 402 ? 503 : 502, status === 402 ? "Face-to-face sessions are unavailable right now." : "The video guide couldn't start. Please try again.");
  }
}
