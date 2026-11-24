/**
 * The school's subjects, from the brief (pages 1–2), plus "Wisdom in Action",
 * the principle every subject leads into (page 7).
 */
export type GeometryMotif =
  | "seed"
  | "vesica"
  | "flower"
  | "metatron"
  | "triangles"
  | "spiral"
  | "torus"
  | "hexagram"
  | "circles";

export type StudyArea = {
  key: string;
  name: string;
  short: string;
  description: string;
  /** From the brief's "Knowledge acquired → Practical application" table */
  inAction: string;
  motif: GeometryMotif;
};

export const STUDY_AREAS: StudyArea[] = [
  {
    key: "self-knowledge",
    name: "Self-knowledge",
    short: "Who you truly are",
    description: "Understanding our inner nature, purpose, emotions, thoughts and potential.",
    inAction: "Develop healthier families and relationships",
    motif: "seed",
  },
  {
    key: "consciousness",
    name: "Consciousness & awareness",
    short: "How awareness shapes experience",
    description: "Learning how consciousness influences our perceptions, decisions and experiences.",
    inAction: "Make wiser, more conscious decisions",
    motif: "torus",
  },
  {
    key: "universal-principles",
    name: "Universal principles",
    short: "Harmony, balance, cause and effect",
    description: "Interconnectedness, harmony, balance, cause and effect, and the unity of life.",
    inAction: "Protect the environment we all share",
    motif: "metatron",
  },
  {
    key: "meditation",
    name: "Meditation & contemplation",
    short: "Stillness, clarity, presence",
    description: "Developing inner stillness, clarity, mindfulness and self-awareness.",
    inAction: "Promote mental clarity and well-being",
    motif: "circles",
  },
  {
    key: "spiritual-wisdom",
    name: "Spiritual wisdom",
    short: "The world's wisdom traditions",
    description: "Studying the wisdom traditions of different civilisations and cultures.",
    inAction: "Promote peace and understanding",
    motif: "flower",
  },
  {
    key: "holistic-wellbeing",
    name: "Energy & holistic well-being",
    short: "Mind, body and spirit in balance",
    description: "Traditional approaches to balancing the mind, body and spirit.",
    inAction: "Support the well-being of others",
    motif: "spiral",
  },
  {
    key: "sacred-geometry",
    name: "Sacred geometry & symbolism",
    short: "The patterns beneath nature",
    description: "The philosophical, mathematical and symbolic meanings behind patterns in nature and ancient traditions.",
    inAction: "Create with beauty and meaning",
    motif: "vesica",
  },
  {
    key: "ethics",
    name: "Ethics & conscious living",
    short: "Compassion, integrity, responsibility",
    description: "Living with compassion, integrity, humility, responsibility and respect for all living beings.",
    inAction: "Establish responsible businesses and leadership",
    motif: "hexagram",
  },
  {
    key: "wisdom-in-action",
    name: "Wisdom in Action",
    short: "Turning insight into service",
    description: "Every subject has a practical application and a contribution to society.",
    inAction: "Establish humanitarian initiatives",
    motif: "triangles",
  },
];

export const STUDY_AREA_BY_KEY = Object.fromEntries(STUDY_AREAS.map((a) => [a.key, a])) as Record<
  string,
  StudyArea
>;

export function studyArea(key: string | null | undefined): StudyArea {
  return (key && STUDY_AREA_BY_KEY[key]) || STUDY_AREAS[0]!;
}

export const CORE_VALUES = [
  "Wisdom",
  "Compassion",
  "Integrity",
  "Unity",
  "Respect",
  "Consciousness",
  "Service to Humanity",
  "Harmony with Nature",
];
