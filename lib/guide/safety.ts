/**
 * A conservative first screen for messages that need care before anything else.
 * It doesn't replace the model's judgement; it makes sure crisis resources are
 * always shown and the model is told to put safety first. Matches are recorded
 * as a flag only: message content is never logged.
 */
export type SafetyFlag = "self_harm" | "harm_from_others" | "medical";

const PATTERNS: [SafetyFlag, RegExp][] = [
  [
    "self_harm",
    /\b(kill(ing)?\s+my\s?self|suicid\w*|end(ing)?\s+(it\s+all|my\s+life)|want(ed)?\s+to\s+die|don'?t\s+want\s+to\s+(live|be\s+alive|be\s+here\s+anymore|exist)|self[-\s]?harm\w*|cut(ting)?\s+my\s?self|hurt(ing)?\s+my\s?self|no\s+reason\s+to\s+live|better\s+off\s+dead|take\s+my\s+(own\s+)?life)\b/i,
  ],
  [
    "harm_from_others",
    /\b((hits?|beats?|chokes?|kicks?|slaps?|strangles?)\s+me|(he|she|they)\s+hurts?\s+me|being\s+(abused|hit|beaten)|domestic\s+(violence|abuse)|rap(e|ed)|sexually\s+assault\w*|(threaten\w*)\s+to\s+(kill|hurt)\s+me|i'?m\s+not\s+safe\s+at\s+home|afraid\s+for\s+my\s+life)\b/i,
  ],
  [
    "medical",
    /\b(chest\s+pain|can'?t\s+breathe|heart\s+attack|having\s+a\s+stroke|seizure|overdos\w*|stop(ped)?\s+taking\s+my\s+(medication|meds|medicine)|instead\s+of\s+(chemo\w*|medication|my\s+meds|medicine|treatment|seeing\s+a\s+doctor))\b/i,
  ],
];

export function screenMessage(text: string): SafetyFlag | null {
  for (const [flag, re] of PATTERNS) if (re.test(text)) return flag;
  return null;
}

export function safetyInstruction(flag: SafetyFlag): string {
  switch (flag) {
    case "self_harm":
      return "SAFETY: The member's latest message may express thoughts of suicide or self-harm. Respond first and foremost with warmth and without judgement. Take it seriously. Gently encourage them to contact their local emergency number or a crisis line now (the page is already showing them crisis resources), and to reach out to someone they trust. Ask whether they are safe right now. Do not offer spiritual reframes of their pain, do not lecture, and stay with them in the conversation.";
    case "harm_from_others":
      return "SAFETY: The member's latest message may indicate they are being harmed or are in danger. Respond with warmth, believe them, and gently encourage them to contact local emergency services if they're in immediate danger, or a confidential support line (the page is already showing resources). Ask whether they are safe right now. Never suggest forgiveness or acceptance of ongoing harm as a spiritual practice.";
    case "medical":
      return "SAFETY: The member's latest message may involve a medical emergency or a decision to replace medical care. Encourage them clearly and kindly to contact emergency services or their doctor. Make clear that spiritual practices can accompany, but never replace, medical care.";
  }
}

export const CRISIS_RESOURCES = {
  self_harm: {
    title: "You don't have to go through this alone",
    lines: [
      "If you might act on thoughts of ending your life, or you're in danger right now, call your local emergency number (for example 911 in the US and Canada, 999 in the UK, 112 in the EU and India).",
      "In the US you can call or text 988 to reach the Suicide & Crisis Lifeline.",
      "Find free, confidential helplines in your country at findahelpline.com.",
      "Reaching out to someone you trust, today, matters too.",
    ],
  },
  harm_from_others: {
    title: "Your safety comes first",
    lines: [
      "If you're in immediate danger, call your local emergency number (for example 911, 999 or 112).",
      "Free, confidential support lines for abuse and violence are listed by country at findahelpline.com.",
      "Sophia is an AI and can't contact anyone for you.",
    ],
  },
  medical: {
    title: "Please get medical help",
    lines: [
      "If this is an emergency, call your local emergency number now (for example 911, 999 or 112).",
      "For anything about medication or treatment, speak to your doctor. Spiritual practice can accompany medical care, never replace it.",
    ],
  },
} satisfies Record<SafetyFlag, { title: string; lines: string[] }>;
