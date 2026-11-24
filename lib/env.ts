/** Server-side configuration. Never import from client components. */
function str(name: string, fallback = ""): string {
  return (process.env[name] ?? fallback).trim();
}

export const env = {
  appUrl: () => str("APP_URL", "http://localhost:3000"),
  isProduction: () => process.env.NODE_ENV === "production",

  openrouterKey: () => str("OPENROUTER_API_KEY"),
  guideModelFree: () => str("GUIDE_MODEL_FREE", "anthropic/claude-haiku-5.5"),
  guideModelPaid: () => str("GUIDE_MODEL_PAID", "anthropic/claude-sonnet-5.5"),
  guideModelUtility: () => str("GUIDE_MODEL_UTILITY", "anthropic/claude-haiku-5.5"),

  geminiKey: () => str("GEMINI_API_KEY"),
  geminiLiveModel: () => str("GEMINI_LIVE_MODEL", "gemini-3.8-live"),
  geminiLiveVoice: () => str("GEMINI_LIVE_VOICE", "Aoede"),

  tavusKey: () => str("TAVUS_API_KEY"),
  tavusReplicaId: () => str("TAVUS_REPLICA_ID"),
  tavusPersonaId: () => str("MYSTICAL_TAVUS_PERSONA_ID"),

  smartmeetEnabled: () => str("SMARTMEET_ENABLED") === "true",
  smartmeetApiUrl: () => str("SMARTMEET_API_URL").replace(/\/+$/, ""),
  smartmeetApiKey: () => str("SMARTMEET_API_KEY"),

  paymentsProvider: () => str("PAYMENTS_PROVIDER", "local-test"),
};

export function capabilities() {
  return {
    text: Boolean(env.openrouterKey()),
    voice: Boolean(env.geminiKey()),
    video: Boolean(env.tavusKey() && env.tavusReplicaId() && env.tavusPersonaId()),
    smartmeet: env.smartmeetEnabled() && Boolean(env.smartmeetApiKey() && env.smartmeetApiUrl()),
  };
}
