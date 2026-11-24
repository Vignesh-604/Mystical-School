import { env } from "./env";

/**
 * SmartMeet integration for community gatherings (Kenneth's suggestion in the brief).
 * Uses SmartMeet's external API: POST /meetings → joinUrl.
 * OFF unless SMARTMEET_ENABLED=true, because it creates real meetings on
 * production smartmeet.org. Invitations by email and WhatsApp are always turned off.
 */
export class SmartMeetError extends Error {}

export async function createSmartMeetMeeting(input: {
  title: string;
  description: string;
  startsAt: Date;
  organizerName: string;
  organizerEmail: string;
}) {
  if (!env.smartmeetEnabled()) throw new SmartMeetError("SmartMeet is not enabled.");
  const iso = input.startsAt.toISOString();
  const res = await fetch(`${env.smartmeetApiUrl()}/meetings`, {
    method: "POST",
    headers: { "X-API-Key": env.smartmeetApiKey(), "Content-Type": "application/json" },
    body: JSON.stringify({
      title: input.title,
      description: input.description,
      date: iso.slice(0, 10),
      time: iso.slice(11, 16),
      timezone: "UTC",
      organizerName: input.organizerName,
      organizerEmail: input.organizerEmail,
      sourcePlatform: "mystical-school",
      options: { sendEmail: false, sendWhatsApp: false },
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const body = (await res.json().catch(() => ({}))) as { ok?: boolean; joinUrl?: string; meeting?: { meetingId?: string }; error?: string };
  if (!res.ok || !body.joinUrl) throw new SmartMeetError(body.error ?? `SmartMeet returned ${res.status}`);
  return { joinUrl: body.joinUrl, meetingId: body.meeting?.meetingId ?? null };
}
