import type { ItineraryDay } from "../../lib/db/schema";

/** Sample retreats for the local build. Venues, dates and prices are illustrative. */
export type SeedRetreat = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  location: string;
  country: string;
  studyArea: string;
  startDate: string;
  endDate: string;
  hostName: string;
  depositPercent: number;
  itinerary: ItineraryDay[];
  includes: string[];
  notIncluded: string[];
  cancellationPolicy: string;
  rooms: { name: string; description: string; priceCents: number; capacity: number; maxGuestsPerBooking: number }[];
};

const STANDARD_POLICY =
  "Cancel more than 60 days before the retreat for a full refund, less a $100 administration fee. Between 60 and 30 days, your deposit is kept and anything above it is refunded. Within 30 days, payments can't be refunded, but you may transfer your place to someone else at no cost.";

export const RETREATS: SeedRetreat[] = [
  {
    slug: "seven-days-of-silence",
    title: "Seven Days of Silence",
    summary: "A guided silent meditation retreat on the banks of the Ganges, for beginners and experienced meditators alike.",
    description:
      "Silence is not empty. Over seven days of noble silence, guided meditation, gentle yoga and contemplative walks along the river, you'll experience the stillness that the Still Mind course points towards. Each day includes a short teaching and optional one-to-one check-ins with the teachers. Silence is held gently: teachers are always available for practical or emotional needs.",
    location: "Rishikesh, Uttarakhand",
    country: "India",
    studyArea: "meditation",
    startDate: "2027-03-10",
    endDate: "2027-03-17",
    hostName: "Kenji Arai and Priya Nair",
    depositPercent: 25,
    itinerary: [
      { day: "Day 1", title: "Arrival and opening circle", detail: "Arrive by 3 pm. Settle in, meet the teachers, and enter silence after the evening circle." },
      { day: "Days 2–3", title: "Arriving in the body", detail: "Breath and body-scan meditation, morning yoga, and walking practice by the river." },
      { day: "Days 4–5", title: "Deepening", detail: "Longer sits, loving-kindness practice, and an optional sunrise walk to a nearby ashram." },
      { day: "Day 6", title: "Wisdom in Action", detail: "Silent morning of service with a local community kitchen, followed by contemplation." },
      { day: "Day 7", title: "Returning", detail: "Silence ends at lunch. Closing circle and integration session: carrying stillness home." },
      { day: "Day 8", title: "Departure", detail: "Breakfast and farewells. Departures by 11 am." },
    ],
    includes: [
      "Seven nights' accommodation",
      "Three vegetarian meals a day",
      "All teachings, meditation sessions and yoga",
      "One-to-one check-ins with teachers",
      "Airport transfer from Dehradun (Jolly Grant)",
    ],
    notIncluded: ["Flights", "Travel insurance (required)", "Visa fees"],
    cancellationPolicy: STANDARD_POLICY,
    rooms: [
      { name: "Shared twin room", description: "Simple twin room shared with one other guest of the same gender, with en-suite bathroom.", priceCents: 145000, capacity: 12, maxGuestsPerBooking: 2 },
      { name: "Private garden room", description: "Quiet single room opening onto the ashram gardens.", priceCents: 215000, capacity: 6, maxGuestsPerBooking: 1 },
      { name: "Riverside room for two", description: "A larger room with a river view, for couples or friends sharing.", priceCents: 195000, capacity: 4, maxGuestsPerBooking: 2 },
    ],
  },
  {
    slug: "geometry-in-stone",
    title: "Geometry in Stone",
    summary: "Five days at Chartres exploring the geometry, light and symbolism of one of the world's great cathedrals.",
    description:
      "Chartres Cathedral is a masterpiece of medieval geometry and light. With architect and geometric artist Elena Vasquez, you'll study its proportions, walk its famous labyrinth, and draw its patterns with compass and straightedge. Mornings are for study and drawing; afternoons for quiet visits and contemplation. No previous drawing experience is needed.",
    location: "Chartres, Centre-Val de Loire",
    country: "France",
    studyArea: "sacred-geometry",
    startDate: "2027-05-12",
    endDate: "2027-05-17",
    hostName: "Elena Vasquez",
    depositPercent: 25,
    itinerary: [
      { day: "Day 1", title: "Arrival", detail: "Arrive by 4 pm. Welcome dinner and an evening walk to see the cathedral at dusk." },
      { day: "Day 2", title: "The circle and the square", detail: "Morning drawing studio; afternoon guided visit to the west front and its sculpture." },
      { day: "Day 3", title: "The labyrinth", detail: "Walk the labyrinth on the cathedral floor, then construct it yourself in the studio." },
      { day: "Day 4", title: "Light and the rose windows", detail: "Study the geometry of the rose windows and the symbolism of light." },
      { day: "Day 5", title: "Your own design", detail: "Create a final piece and share it in the closing circle." },
      { day: "Day 6", title: "Departure", detail: "Breakfast and departures by 11 am. Trains to Paris run hourly." },
    ],
    includes: ["Five nights in a historic guesthouse", "Breakfast and dinner daily", "All studio sessions and materials", "Guided cathedral visits"],
    notIncluded: ["Travel to Chartres", "Lunches", "Travel insurance (required)"],
    cancellationPolicy: STANDARD_POLICY,
    rooms: [
      { name: "Twin room", description: "Shared twin room in the guesthouse, en-suite.", priceCents: 198000, capacity: 10, maxGuestsPerBooking: 2 },
      { name: "Single room", description: "Private single room, en-suite.", priceCents: 248000, capacity: 4, maxGuestsPerBooking: 1 },
    ],
  },
  {
    slug: "wisdom-in-action-monteverde",
    title: "Wisdom in Action: Cloud Forest Service Retreat",
    summary: "A week of reforestation, community service and contemplation in Costa Rica's cloud forest.",
    description:
      "This retreat puts the school's founding principle into practice. Mornings are spent with a local conservation cooperative, planting native trees along wildlife corridors and supporting community projects. Afternoons and evenings hold meditation, reflection and teachings on interconnectedness. You'll leave with dirt under your nails, new friends, and a renewed sense of what wisdom looks like in action.",
    location: "Monteverde, Puntarenas",
    country: "Costa Rica",
    studyArea: "wisdom-in-action",
    startDate: "2027-09-06",
    endDate: "2027-09-13",
    hostName: "Grace Mwangi and Tomás Rivera",
    depositPercent: 20,
    itinerary: [
      { day: "Day 1", title: "Arrival", detail: "Shared transfer from San José. Welcome circle and dinner with cooperative members." },
      { day: "Days 2–3", title: "Roots", detail: "Learn the forest corridor project and plant native seedlings. Evening teachings on interconnectedness." },
      { day: "Day 4", title: "Rest and the forest", detail: "Guided night walk and a silent day in the cloud forest reserve." },
      { day: "Days 5–6", title: "Community", detail: "Work alongside a local school garden project. Reflection on service and humility." },
      { day: "Day 7", title: "Closing", detail: "Commitments circle: what you'll carry home. Farewell celebration." },
      { day: "Day 8", title: "Departure", detail: "Shared transfer to San José airport." },
    ],
    includes: [
      "Seven nights in eco-lodge cabins",
      "All meals",
      "A donation per guest to the conservation cooperative",
      "Shared transfers from San José",
      "All teachings and activities",
    ],
    notIncluded: ["Flights", "Travel insurance (required)", "Work gloves and boots (packing list provided)"],
    cancellationPolicy: STANDARD_POLICY,
    rooms: [
      { name: "Shared cabin", description: "Bunk cabin for up to four guests, shared bathroom block.", priceCents: 125000, capacity: 16, maxGuestsPerBooking: 4 },
      { name: "Private cabin", description: "Private cabin with en-suite bathroom, for one or two guests.", priceCents: 175000, capacity: 6, maxGuestsPerBooking: 2 },
    ],
  },
  {
    slug: "temple-and-forest-koyasan",
    title: "Temple and Forest",
    summary: "Six nights of temple life on sacred Mount Kōya, with dialogue across traditions.",
    description:
      "Stay in a working temple on Mount Kōya, one of Japan's great pilgrimage sites. Join the monks' morning prayers if you wish, walk the cedar forest of Okunoin, and spend afternoons in dialogue on the shared questions at the heart of the Wisdom Traditions course. Participants of every tradition, or none, are warmly welcome; no one is asked to adopt any practice.",
    location: "Kōyasan, Wakayama",
    country: "Japan",
    studyArea: "spiritual-wisdom",
    startDate: "2027-10-18",
    endDate: "2027-10-24",
    hostName: "Dr. Samira Haddad and Kenji Arai",
    depositPercent: 25,
    itinerary: [
      { day: "Day 1", title: "Ascent", detail: "Meet in Osaka and travel together by train and cable car to the mountain. Welcome dinner of temple cuisine." },
      { day: "Day 2", title: "Morning prayers and the forest", detail: "Optional dawn prayers; afternoon walk through Okunoin cemetery forest." },
      { day: "Days 3–4", title: "Shared questions", detail: "Dialogue sessions on purpose, goodness and compassion across traditions." },
      { day: "Day 5", title: "Pilgrimage path", detail: "Walk a section of the Choishi-michi pilgrimage trail." },
      { day: "Day 6", title: "Closing", detail: "Closing dialogue and integration." },
      { day: "Day 7", title: "Descent", detail: "Return to Osaka by midday." },
    ],
    includes: ["Six nights' temple lodging (shukubo)", "Breakfast and dinner daily (vegetarian temple cuisine)", "Rail travel from Osaka and back", "All sessions and entry fees"],
    notIncluded: ["Flights", "Lunches", "Travel insurance (required)"],
    cancellationPolicy: STANDARD_POLICY,
    rooms: [
      { name: "Shared tatami room", description: "Traditional tatami room shared with one other guest, futon bedding, shared bathing.", priceCents: 189000, capacity: 8, maxGuestsPerBooking: 2 },
      { name: "Private tatami room", description: "Private tatami room with garden view.", priceCents: 239000, capacity: 3, maxGuestsPerBooking: 1 },
    ],
  },
];
