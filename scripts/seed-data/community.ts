/** Sample community content for the local build. Members are fictional and cannot sign in. */
export const CIRCLES = [
  { slug: "introductions", name: "Introductions", description: "New here? Say hello, share what brought you, and meet fellow members.", studyArea: null },
  { slug: "self-knowledge", name: "Self-knowledge", description: "Reflections, questions and discoveries on the path of knowing yourself.", studyArea: "self-knowledge" },
  { slug: "meditation", name: "Meditation", description: "Practise together, share what's working, and support each other's sitting.", studyArea: "meditation" },
  { slug: "consciousness", name: "Consciousness", description: "Explore awareness, perception and the nature of mind.", studyArea: "consciousness" },
  { slug: "universal-principles", name: "Harmony with Nature", description: "Interconnectedness, balance and care for the living world.", studyArea: "universal-principles" },
  { slug: "spiritual-wisdom", name: "Wisdom Traditions", description: "Respectful conversation across the world's traditions.", studyArea: "spiritual-wisdom" },
  { slug: "holistic-wellbeing", name: "Holistic Well-being", description: "Balancing body, mind and spirit, alongside (never instead of) good medical care.", studyArea: "holistic-wellbeing" },
  { slug: "sacred-geometry", name: "Sacred Geometry", description: "Share drawings, constructions and the meanings you find in pattern.", studyArea: "sacred-geometry" },
  { slug: "ethics", name: "Conscious Leadership", description: "Ethics in work, business and leadership.", studyArea: "ethics" },
  { slug: "wisdom-in-action", name: "Wisdom in Action", description: "Share your commitments, find collaborators, and celebrate what members are doing for others.", studyArea: "wisdom-in-action" },
];

export const MEMBERS = [
  { key: "leila", name: "Leila Haddad", location: "Beirut", bio: "Teacher and mother of two. Drawn to Sufi poetry and quiet mornings." },
  { key: "tomas", name: "Tomás Rivera", location: "Mexico City", bio: "Architect turned community organiser. Learning to slow down." },
  { key: "grace", name: "Grace Mwangi", location: "Nairobi", bio: "Ecologist. I plant trees and try to listen to them." },
  { key: "henrik", name: "Henrik Larsen", location: "Copenhagen", bio: "Software engineer exploring meditation and ethics in tech." },
  { key: "priya", name: "Priya Nair", location: "Kochi", bio: "Yoga teacher, curious about consciousness and everyday kindness." },
  { key: "mei", name: "Mei Chen", location: "Vancouver", bio: "Nurse. Looking for ways to bring stillness to people who care for others." },
];

export const POSTS: { circle: string; author: string; body: string; hoursAgo: number; comments: { author: string; body: string }[]; resonates: string[] }[] = [
  {
    circle: "introductions",
    author: "mei",
    hoursAgo: 5,
    body: "Hello everyone. I'm Mei, a nurse in Vancouver. After a hard few years on the wards I realised I'd stopped noticing anything good in a day. I'm here to learn to be present again, and hopefully help my colleagues do the same.",
    comments: [
      { author: "priya", body: "Welcome, Mei. Thank you for the care you give. The Meditation circle has a gentle morning sit you'd be very welcome at." },
      { author: "leila", body: "So glad you're here. Noticing one good thing a day is how I began too." },
    ],
    resonates: ["priya", "leila", "grace"],
  },
  {
    circle: "meditation",
    author: "henrik",
    hoursAgo: 20,
    body: "Week three of the Still Mind course. Today I noticed the tone of my 'returning' for the first time. It was harsh, like a manager. Trying the 'small child learning to walk' voice instead. Strangely moving.",
    comments: [{ author: "priya", body: "That lesson changed my practice too. The kindness slowly leaks into everything else." }],
    resonates: ["priya", "mei"],
  },
  {
    circle: "wisdom-in-action",
    author: "grace",
    hoursAgo: 30,
    body: "Our Neighbourhood Tree Circle planted 40 native saplings on Saturday with 12 neighbours, three of whom had never met. Next planting is in two weeks. If you're in Nairobi, come! And if you're elsewhere, the project page has a short guide to starting your own.",
    comments: [
      { author: "tomas", body: "This is beautiful. I'm going to try this with my building in Mexico City." },
      { author: "henrik", body: "Forty! Congratulations to everyone involved." },
    ],
    resonates: ["tomas", "henrik", "leila", "mei", "priya"],
  },
  {
    circle: "spiritual-wisdom",
    author: "leila",
    hoursAgo: 48,
    body: "A question I'd love to hear many answers to: what does your tradition (or your family) teach about welcoming the stranger? In mine, a guest is a gift from God, and you feed them before you ask their name.",
    comments: [
      { author: "priya", body: "We say 'Atithi Devo Bhava': the guest is as God. My grandmother would never let anyone leave hungry." },
      { author: "henrik", body: "I didn't grow up with a tradition, but my grandfather left the door unlocked on stormy nights in case a traveller needed shelter. I think that counts." },
    ],
    resonates: ["priya", "henrik", "tomas"],
  },
  {
    circle: "sacred-geometry",
    author: "tomas",
    hoursAgo: 72,
    body: "Drew the seed of life slowly for the first time, over an hour. My compass slipped twice exactly when my mind wandered to work. Geometry is a very honest meditation teacher.",
    comments: [],
    resonates: ["leila"],
  },
  {
    circle: "ethics",
    author: "henrik",
    hoursAgo: 100,
    body: "Tried the ripple map from Conscious Leadership on a product decision at work. The outermost ring was 'users who will never read the terms'. We changed the default setting because of it. Small, but real.",
    comments: [{ author: "tomas", body: "That's exactly the point of the exercise. Well done for actually changing it." }],
    resonates: ["tomas", "grace"],
  },
];

export const PROJECTS = [
  {
    slug: "morning-stillness-for-caregivers",
    title: "Morning Stillness for Caregivers",
    summary: "Free 15-minute guided sits for nurses, carers and family caregivers before their shifts.",
    description:
      "Caregivers give attention all day and rarely receive it. This project offers a short, free, guided meditation online three mornings a week, designed around shift patterns. We're building a small rota of members who can lead a sit, plus a library of recordings for night-shift workers.",
    studyArea: "meditation",
    helpWanted: "Members who can lead a 15-minute sit once a fortnight; someone to help with recordings.",
    status: "active" as const,
    owner: "mei",
    members: ["priya", "henrik"],
    updates: [
      { author: "mei", body: "First three sessions done. Nine colleagues came on Tuesday, mostly from the night shift. Two asked for a weekend session.", hoursAgo: 26 },
    ],
  },
  {
    slug: "neighbourhood-tree-circle",
    title: "Neighbourhood Tree Circle",
    summary: "Planting native trees with neighbours, and a simple guide for starting your own circle anywhere.",
    description:
      "We plant native trees on shared land with permission from the local council, and use each planting as a chance for neighbours to meet. The project also maintains an open guide so any member can start a tree circle in their own neighbourhood.",
    studyArea: "universal-principles",
    helpWanted: "People to start circles in their own cities; anyone who can help translate the guide.",
    status: "active" as const,
    owner: "grace",
    members: ["tomas"],
    updates: [
      { author: "grace", body: "40 saplings planted with 12 neighbours. Survival check in one month.", hoursAgo: 30 },
      { author: "tomas", body: "I've asked my building's residents' committee about the courtyard. Meeting next week.", hoursAgo: 8 },
    ],
  },
  {
    slug: "evenings-of-shared-questions",
    title: "Evenings of Shared Questions",
    summary: "Monthly interfaith conversations around one simple question, hosted online and in person.",
    description:
      "Each month a small group from different traditions gathers around one question, such as 'What does your tradition teach about welcoming strangers?'. We use the agreements from the Wisdom Traditions course: speak from your own experience, listen to understand, no attempts to convert.",
    studyArea: "spiritual-wisdom",
    helpWanted: "Hosts in new cities; members from traditions not yet represented.",
    status: "forming" as const,
    owner: "leila",
    members: ["priya"],
    updates: [],
  },
];

export const GATHERINGS = [
  { title: "Open Circle: monthly community gathering", description: "Meet members from around the world, share what you're practising, and hear updates from Wisdom in Action projects.", host: "priya", circle: "introductions", project: null, daysFromNow: 3, hour: 17, durationMin: 60 },
  { title: "Morning sit for caregivers", description: "A gentle 15-minute guided sit before the day begins. Cameras optional.", host: "mei", circle: null, project: "morning-stillness-for-caregivers", daysFromNow: 1, hour: 6, durationMin: 20 },
  { title: "Shared Questions: welcoming the stranger", description: "Our first evening conversation. Please read the agreements on the project page beforehand.", host: "leila", circle: "spiritual-wisdom", project: "evenings-of-shared-questions", daysFromNow: 9, hour: 18, durationMin: 75 },
];
