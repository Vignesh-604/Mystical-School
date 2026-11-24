/**
 * Creates Sophia's persona on the Tavus account in TAVUS_API_KEY, for the
 * face-to-face video guide. This WRITES to a third-party account that is shared
 * with other projects, so run it only with the account owner's approval:
 *
 *   npm run tavus:persona -- --yes
 *
 * It prints the new persona id; put it in .env as MYSTICAL_TAVUS_PERSONA_ID.
 * Creating a persona is free; conversations are billed per minute by Tavus.
 */
import { tavusPersonaPrompt } from "../lib/guide/prompt";

async function main() {
  const key = process.env.TAVUS_API_KEY;
  const replica = process.env.TAVUS_REPLICA_ID;
  if (!key || !replica) throw new Error("TAVUS_API_KEY and TAVUS_REPLICA_ID must be set in .env");
  if (!process.argv.includes("--yes")) {
    console.log("This creates a persona named 'Mystical School · Sophia' on the Tavus account.");
    console.log("Re-run with --yes to proceed:  npm run tavus:persona -- --yes");
    return;
  }

  const list = (await (await fetch("https://tavusapi.com/v2/personas?limit=100", { headers: { "x-api-key": key } })).json()) as {
    data?: { persona_id: string; persona_name: string }[];
  };
  const existing = list.data?.find((p) => p.persona_name === "Mystical School · Sophia");
  if (existing) {
    console.log(`Persona already exists: ${existing.persona_id}`);
    console.log(`Set MYSTICAL_TAVUS_PERSONA_ID=${existing.persona_id} in .env`);
    return;
  }

  const res = await fetch("https://tavusapi.com/v2/personas", {
    method: "POST",
    headers: { "x-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      persona_name: "Mystical School · Sophia",
      pipeline_mode: "full",
      system_prompt: tavusPersonaPrompt(),
      context:
        "You are speaking with a member of the Mystical School in a live video call. Member-specific context is provided per conversation.",
      default_replica_id: replica,
    }),
  });
  const body = (await res.json()) as { persona_id?: string; message?: string };
  if (!res.ok || !body.persona_id) throw new Error(`Tavus persona creation failed (${res.status}): ${body.message ?? ""}`);
  console.log(`Created persona ${body.persona_id}`);
  console.log(`Set MYSTICAL_TAVUS_PERSONA_ID=${body.persona_id} in .env, then restart the dev server.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
