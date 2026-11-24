import { getDb } from "./db";
import { auditLog } from "./db/schema";
import { newId } from "./ids";

/** Record a consequential action. Never put message content or secrets in `meta`. */
export function audit(actorId: string | null, action: string, target?: string, meta?: Record<string, unknown>) {
  getDb()
    .insert(auditLog)
    .values({ id: newId("aud"), actorId, action, target: target ?? null, meta: meta ?? null })
    .run();
}
