/**
 * Membership tiers, limits and prices: the single source of truth.
 * Prices are placeholders until the school sets them (docs/PLAN.md §3).
 */
export type PlanKey = "seeker" | "initiate";
export type BillingInterval = "month" | "year";

export type PlanLimits = {
  chatMessagesPerDay: number;
  voiceSecondsPerDay: number;
  videoSecondsPerMonth: number;
  memory: boolean;
  model: "free" | "paid";
};

export const PLANS: Record<PlanKey, { name: string; tagline: string; limits: PlanLimits }> = {
  seeker: {
    name: "Seeker",
    tagline: "Free. Begin the journey.",
    limits: {
      chatMessagesPerDay: 15,
      voiceSecondsPerDay: 5 * 60,
      videoSecondsPerMonth: 0,
      memory: false,
      model: "free",
    },
  },
  initiate: {
    name: "Initiate",
    tagline: "Deeper guidance that remembers your path.",
    limits: {
      chatMessagesPerDay: 200,
      voiceSecondsPerDay: 60 * 60,
      videoSecondsPerMonth: 30 * 60,
      memory: true,
      model: "paid",
    },
  },
};

export const INITIATE_PRICES: Record<BillingInterval, { cents: number; label: string }> = {
  month: { cents: 1900, label: "$19 / month" },
  year: { cents: 19000, label: "$190 / year" },
};

/** Longest single live session, whatever the remaining allowance. */
export const MAX_VOICE_SESSION_SECONDS = 15 * 60;
export const MAX_VIDEO_SESSION_SECONDS = 15 * 60;

export const PLAN_FEATURES: { label: string; seeker: string; initiate: string }[] = [
  { label: "Text guidance with Sophia", seeker: "15 messages a day", initiate: "200 a day (fair use)" },
  { label: "Guidance model", seeker: "Claude Haiku", initiate: "Claude Sonnet, deeper and more nuanced" },
  { label: "Journey memory", seeker: "Your intention and focus areas", initiate: "Sophia remembers your path" },
  { label: "Live voice sessions", seeker: "5 minutes a day", initiate: "60 minutes a day" },
  { label: "Face-to-face video guide", seeker: "—", initiate: "30 minutes a month" },
  { label: "Community, circles and projects", seeker: "Included", initiate: "Included" },
  { label: "Courses and retreats", seeker: "Bought separately", initiate: "Bought separately" },
];
