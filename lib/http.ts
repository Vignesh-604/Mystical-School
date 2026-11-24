import { NextResponse } from "next/server";

/**
 * Defence in depth for JSON endpoints: the session cookie is SameSite=Lax, and
 * we also refuse state-changing requests whose Origin isn't this site.
 */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return req.headers.get("sec-fetch-site") !== "cross-site";
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export function jsonError(status: number, error: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error, ...extra }, { status });
}
