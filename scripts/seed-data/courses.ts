/**
 * Sample curriculum written for the local build, based on the subjects in the brief.
 * The school should replace it with its own courses.
 */
export type SeedLesson = {
  title: string;
  durationMin: number;
  body: string;
  practice: string;
  action: string;
  preview?: boolean;
};
export type SeedCourse = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  studyArea: string;
  level: "foundation" | "intermediate" | "advanced";
  priceCents: number;
  teacherName: string;
  teacherBio: string;
  durationLabel: string;
  outcomes: string[];
  modules: { title: string; lessons: SeedLesson[] }[];
};

export const COURSES: SeedCourse[] = [
  {
    slug: "know-thyself",
    title: "Know Thyself",
    subtitle: "Foundations of self-discovery",
    description:
      "The oldest instruction in the Western tradition, carved at Delphi, is also the most practical. This course is a six-week path into your inner landscape: how you notice, react, tell stories and choose. You will finish with a clearer sense of your values and one concrete way to offer them to the people around you.",
    studyArea: "self-knowledge",
    level: "foundation",
    priceCents: 8900,
    teacherName: "Amara Okafor",
    teacherBio:
      "Amara has guided contemplative self-inquiry groups for fifteen years, drawing on Socratic dialogue, journaling and Ignatian reflection.",
    durationLabel: "6 weeks · about 2 hours a week",
    outcomes: [
      "Observe your thoughts and emotions without being ruled by them",
      "Recognise the stories and patterns that shape your reactions",
      "Name the values you want to live by",
      "Turn self-knowledge into one act of service in your own life",
    ],
    modules: [
      {
        title: "The inner landscape",
        lessons: [
          {
            title: "Why know yourself?",
            durationMin: 18,
            preview: true,
            body: `"Know thyself" was carved above the entrance to the temple at Delphi. It was not an invitation to self-absorption. The ancient Greeks understood it as a reminder of our limits and our responsibility: before we try to change the world, we should understand the instrument we change it with.

Most of us know a great deal *about* ourselves: our preferences, our history, our roles. Fewer of us know how we work: what happens in the half-second between a remark and our reply, what we reach for when we feel unsafe, which values we actually live by when no one is looking.

This course treats self-knowledge as a practice rather than a puzzle. Each week you will **observe**, **reflect** and **apply**. Observation comes first because it is the most neglected. Reflection turns what you saw into understanding. Application, the school's principle of *Wisdom in Action*, is how understanding becomes character.

> When individuals transform themselves, they can transform their families.

You don't need to believe anything in particular to take this course. You only need to be willing to look honestly, and kindly, at your own life.`,
            practice:
              "Three times today, at moments you choose in advance (a doorway, a cup of tea, a red light), pause for three breaths and silently name what you are feeling, in one word. Don't explain or fix it. Just name it.",
            action:
              "Notice one moment today when someone else seemed to be struggling with a feeling. Offer them the same patience you practised offering yourself.",
          },
          {
            title: "The observer within",
            durationMin: 22,
            body: `Contemplative traditions across the world describe a capacity that is easy to overlook: the part of us that can *notice* what we are thinking and feeling. Some call it the witness, some awareness, some simply attention.

The moment you notice "I'm getting irritated," something has already shifted. You are no longer only the irritation; you are also the one who sees it. That small gap is where choice lives.

In this lesson we strengthen the observer with a simple tool: **noting**. When a thought or feeling arises, you give it a soft, neutral label: *planning*, *worrying*, *remembering*, *judging*, *longing*. The label is not a verdict. It is a way of stepping half a pace back.

People often worry that observing their emotions will make them cold. In practice the opposite tends to happen. When you're not drowning in a feeling, you can actually feel it, and you can see other people's feelings more clearly too.

Be patient with yourself. The mind wanders constantly; noticing that it has wandered *is* the practice, not a failure of it.`,
            practice:
              "Sit comfortably for ten minutes. Rest your attention on your breathing. Whenever you notice a thought, label it in one or two words (planning, remembering, worrying) and return to the breath. Count, roughly, how often you returned. Each return is one repetition.",
            action:
              "In one conversation today, try to notice your own reaction before you reply. Afterwards, write one sentence about what you noticed.",
          },
        ],
      },
      {
        title: "Patterns and reactions",
        lessons: [
          {
            title: "Reading your emotional weather",
            durationMin: 20,
            body: `Emotions are not problems to be solved. They are information, like weather: they arrive, change and pass. Trouble begins when we either ignore the forecast or mistake one storm for the whole climate.

This week you'll begin a simple **emotional weather log**. Twice a day, note three things: the feeling, where you feel it in the body, and what seemed to trigger it. After a week, patterns appear. Perhaps tiredness turns into impatience every evening. Perhaps a certain kind of message always lands as criticism.

Seeing a pattern is not the same as being trapped by it. Many traditions teach that what we can see, we can work with. The goal isn't to stop feeling; it's to respond to life consciously rather than react to it automatically.

A word of care: if you find yourself regularly overwhelmed, or feelings stay heavy for weeks, it is a sign of wisdom, not weakness, to speak with a counsellor or doctor. Inner work and professional support belong together.`,
            practice:
              "Keep a weather log for seven days. Morning and evening, write: the main feeling (one word), where it sits in your body, and what came before it. Don't analyse yet. Just collect.",
            action:
              "Share one pattern you discovered with someone you trust, and ask whether they have noticed it too. Listen without defending.",
          },
          {
            title: "The stories we tell",
            durationMin: 24,
            body: `Between every event and every reaction there is a story. A friend doesn't reply to a message, and within minutes the mind has written a whole narrative: *they're annoyed with me*, *I'm always the one who reaches out*.

Stories aren't the enemy. They are how humans make meaning. But some are inherited, some are out of date, and some are simply untrue. This lesson invites you to hold your stories more lightly.

A useful question comes from many contemplative teachers: **"Is it true? Can I be certain it's true?"** Followed by: *Who would I be in this moment without this story?*

You'll practise separating the **facts** of a situation (what a camera would record) from the **story** (what you added). The difference is often surprising. It is also freeing: when you can see the story, you can choose a kinder one, or simply wait for more information.`,
            practice:
              "Choose one recent situation that upset you. On paper, draw a line down the middle. On the left, write only what a camera would have recorded. On the right, write the story you told about it. Then ask of each sentence on the right: can I be certain this is true?",
            action:
              "This week, when someone tells you a story about another person, gently ask what actually happened. Help them see the difference you've been practising.",
          },
        ],
      },
      {
        title: "Purpose and contribution",
        lessons: [
          {
            title: "Values as a compass",
            durationMin: 21,
            body: `Values are not rules. They are directions: like *north*, you never arrive, but you can always tell whether you're heading towards it.

The school names eight core values: wisdom, compassion, integrity, unity, respect, consciousness, service to humanity and harmony with nature. Yours may overlap with these, or be phrased differently. What matters is that they are truly yours, chosen rather than borrowed.

A simple way to discover your values is to look at moments when you felt most alive, and moments when you felt most betrayed. Both point to what you care about. Pride and anger are honest teachers.

Once you have three to five values, test them against your calendar and your bank statement. These are where values become visible. The gap between what we say matters and how we spend our hours is not a cause for shame; it is the next part of the path.`,
            practice:
              "Write down three moments in your life when you felt deeply right, and one when you felt something important was violated. For each, ask: what value was present, or missing? Circle the three values that appear most.",
            action:
              "Choose one value and do one small, visible thing this week that expresses it: something another person will benefit from, even if they never know it was you.",
          },
          {
            title: "From self-knowledge to service",
            durationMin: 26,
            body: `The brief that founded this school puts it plainly: the true measure of mystical knowledge is not how much one knows, but how much love, wisdom, harmony and goodness one brings into the lives of others.

Self-knowledge that stays private eventually turns stale. It becomes self-improvement, which is useful, but small. The traditions this course draws from all point beyond the self: to family, community and the wider world.

In this closing lesson you will design a **Wisdom in Action commitment**: one modest, specific, repeatable contribution that grows from what you've learned about yourself. If you discovered patience is your growing edge, perhaps you volunteer to listen at a helpline training. If integrity is your compass, perhaps you take on one honest conversation you've been avoiding.

Keep it small enough to actually do. Grand plans are a favourite hiding place for the ego. Steady, humble acts are how character is built, and how the world is changed.`,
            practice:
              "Review your weather log, your story exercise and your values. Write a single paragraph beginning: 'What I've learned about myself is… and so I will…'",
            action:
              "Write your Wisdom in Action commitment: what you'll do, for whom, how often, and when you'll start. Consider sharing it in the community's Wisdom in Action circle, so others can encourage you.",
          },
        ],
      },
    ],
  },
  {
    slug: "the-still-mind",
    title: "The Still Mind",
    subtitle: "Meditation and contemplation for everyday life",
    description:
      "A gentle, thorough introduction to meditation that doesn't ask you to empty your mind or adopt a belief. You'll learn breath-based attention, posture, how to work with a wandering mind, loving-kindness, and how to carry stillness into a busy day, then build a practice that actually lasts.",
    studyArea: "meditation",
    level: "foundation",
    priceCents: 6900,
    teacherName: "Kenji Arai",
    teacherBio:
      "Kenji trained in Zen and Insight meditation traditions and has taught secular mindfulness in schools and hospitals for a decade.",
    durationLabel: "4 weeks · 15 minutes a day",
    outcomes: [
      "Sit comfortably and steadily for 20 minutes",
      "Return to the present without self-criticism",
      "Practise loving-kindness towards yourself and others",
      "Keep a sustainable daily practice",
    ],
    modules: [
      {
        title: "Arriving",
        lessons: [
          {
            title: "The breath as an anchor",
            durationMin: 15,
            preview: true,
            body: `Meditation is not about stopping thought. That's a common misunderstanding, and it causes a great deal of unnecessary discouragement. Meditation is the practice of **placing attention, noticing when it moves, and kindly bringing it back**.

The breath is the anchor most traditions begin with, for good reasons. It's always with you, it happens in the present moment, and it responds to attention: when we observe it, it often slows on its own.

You don't need to breathe in any special way. Simply feel the breath where it's most vivid: the cool air at the nostrils, the rise of the chest, or the belly expanding and softening.

Your mind will wander, probably within seconds. This is not failure. The moment you notice you've wandered is a moment of awareness, and returning is the "repetition" that strengthens attention, the way lifting a weight strengthens a muscle.

Start small. Five minutes a day, every day, is worth more than an hour once a month.`,
            practice:
              "Set a timer for five minutes. Sit upright but relaxed. Feel each breath at the belly. Each time you notice your mind has wandered, silently say 'returning' and come back to the next breath. That's all.",
            action:
              "Before your next difficult conversation or task today, take three slow breaths first. Notice whether it changes how you show up for the other person.",
          },
          {
            title: "Posture and ease",
            durationMin: 14,
            body: `There's a line repeated in many meditation halls: *the posture of the body becomes the posture of the mind*. Slumped, we drift towards dullness. Rigid, we tense into effort. The aim is somewhere in between: **dignified and at ease**.

You can meditate on a cushion, a bench or an ordinary chair. On a chair, sit forward a little so your back supports itself, feet flat, hands resting on the thighs. Let the crown of the head lift slightly, as if suspended by a thread, while the shoulders soften.

Lying down is fine for body-scan practices and for anyone who needs it, though it invites sleep. Walking meditation is a full practice in its own right, especially when the mind is restless.

Pain is information. Gentle discomfort can be observed with curiosity; sharp or persistent pain is a signal to adjust. There is no prize for suffering in stillness.`,
            practice:
              "Try three postures for five minutes each over the next few days: a chair, a cushion or bench, and slow walking. Note which helps you feel both alert and relaxed.",
            action:
              "Notice the posture of people around you who seem tense or tired. Offer one of them a small comfort: a chair, a glass of water, a moment of unhurried attention.",
          },
        ],
      },
      {
        title: "Deepening",
        lessons: [
          {
            title: "Working with a wandering mind",
            durationMin: 17,
            body: `Some days the mind is a calm lake. Other days it's a market at noon. Both are fine to meditate with; the restless days are often where the real training happens.

Traditional teachings describe common "hindrances": craving, aversion, sleepiness, restlessness and doubt. Naming them takes away much of their power. *Ah, restlessness.* *Hello, doubt.* Each has an antidote: for sleepiness, open the eyes and straighten the spine; for restlessness, lengthen the out-breath; for doubt, return to the simple instruction and trust the practice for one more minute.

Above all, notice the **tone** in which you return. If the inner voice is harsh (*you've failed again*), you are training harshness. If it's gentle (*there you go, come back*), you are training kindness. The second makes you a better meditator and a better companion.`,
            practice:
              "During your sit, each time you notice you've wandered, also notice the tone of your 'return'. Make it deliberately warm, as you'd speak to a small child learning to walk.",
            action:
              "Use that same warm tone with someone today who makes a mistake: a colleague, a child, a stranger, or yourself.",
          },
          {
            title: "Loving-kindness",
            durationMin: 18,
            body: `Loving-kindness (*metta* in the Pali language of early Buddhist texts) is a practice of deliberately wishing well-being for yourself and others. Similar practices of blessing and intercession exist in many traditions.

The form is simple. You hold someone in mind and silently offer phrases such as: *May you be safe. May you be healthy. May you be at peace. May you live with ease.* You begin with yourself or someone easy to love, then extend to a neutral person, someone difficult, and finally all beings.

People are sometimes surprised that feelings don't always come. That's fine. The practice works on **intention**, and warmth often follows quietly, over weeks.

This is the meditation that most directly serves the school's first aim: creating more compassionate human beings. It softens judgement, and makes it easier to forgive and to understand people different from ourselves.`,
            practice:
              "Ten minutes: two minutes each for yourself, a loved one, a neutral person (a shop assistant, a neighbour), someone you find difficult, and finally all beings everywhere. Use the four phrases slowly.",
            action:
              "Choose the 'neutral person' from your practice and find a way to make their day slightly easier this week.",
          },
        ],
      },
      {
        title: "Living it",
        lessons: [
          {
            title: "Contemplation in daily life",
            durationMin: 16,
            body: `A daily sit is precious, but if stillness lives only on the cushion it stays fragile. Contemplatives across history have looked for prayer and presence in ordinary tasks: washing dishes, walking to work, kneading bread.

Choose a few **anchors** in your day: moments you'll use as reminders to arrive in the present. The first sip of a drink. Washing your hands. The moment before opening an email. Each time, take one conscious breath and feel your feet.

Listening is perhaps the most powerful daily contemplation. When someone speaks to you, try listening as fully as you breathe in meditation: noticing when your attention drifts to your reply, and returning to them.`,
            practice: "Choose three daily anchors and write them on a card. Each time you meet one, take a single conscious breath.",
            action:
              "Have one conversation this week in which you listen without planning your reply. Afterwards, ask the other person what they needed most.",
          },
          {
            title: "A practice that lasts",
            durationMin: 15,
            body: `The difference between people who meditate for a month and those who meditate for a lifetime is rarely discipline. It's usually **design**.

A lasting practice has a fixed time and place, a length you can manage on a hard day, and a gentle plan for missed days (simply start again, no catching up). Many people find it helps to practise with others: a weekly group, a friend, or the circles in this school's community.

Finally, remember why you began. Meditation is not a private achievement. Its fruit is the clarity, patience and kindness you bring to others. Measure your practice by those, not by how still you can sit.`,
            practice: "Write your practice plan: when, where, how long, and what you'll do on a day you miss.",
            action:
              "Invite one person to sit with you, in person or online, once this month. Or join a gathering in the Meditation circle.",
          },
        ],
      },
    ],
  },
  {
    slug: "wisdom-traditions",
    title: "Wisdom Traditions of the World",
    subtitle: "Common questions, many paths",
    description:
      "An open-hearted survey of how humanity's great traditions approach life's deepest questions: purpose, goodness, consciousness and compassion. It treats every tradition with respect, asks no one to abandon their own, and ends with the practice of hosting real dialogue across difference.",
    studyArea: "spiritual-wisdom",
    level: "intermediate",
    priceCents: 11900,
    teacherName: "Dr. Samira Haddad",
    teacherBio:
      "Samira is a scholar of comparative religion who has spent twenty years facilitating interfaith dialogue in Beirut, London and Toronto.",
    durationLabel: "8 weeks · about 3 hours a week",
    outcomes: [
      "Describe how several traditions approach shared human questions",
      "Read sacred and philosophical texts with care and context",
      "Hold your own beliefs while genuinely understanding others'",
      "Facilitate a respectful conversation across traditions",
    ],
    modules: [
      {
        title: "Common questions",
        lessons: [
          {
            title: "What every tradition asks",
            durationMin: 25,
            preview: true,
            body: `Languages, rituals and symbols differ enormously between the world's traditions. Yet again and again they circle the same questions: *What is the purpose of life? What does it mean to be a good human being? What is the nature of consciousness? Why should we practise compassion? How can we live in harmony?*

This course doesn't try to prove that all traditions secretly say the same thing. That claim flattens real and important differences. Instead, it shows how differently they answer shared questions, and what we can learn from each answer.

You will meet ideas such as the Confucian emphasis on cultivating virtue in relationships, the Upanishadic inquiry into the self, the Abrahamic call to justice and mercy, the Buddhist analysis of suffering, Indigenous understandings of kinship with land, and the Stoic practice of living according to reason and nature.

Throughout, the principle is simple: **understand before you evaluate**, and honour what is sacred to others as you would want your own to be honoured.`,
            practice:
              "Choose one of the five questions above. Write your own honest answer today, in a paragraph. Keep it; you'll return to it at the end of the course.",
            action: "Ask someone from a different background how their tradition, or their family, would answer the same question. Listen and say thank you.",
          },
          {
            title: "Reading sacred texts with care",
            durationMin: 22,
            body: `Sacred texts are not ordinary documents. They have been read, sung, argued over and lived by communities for centuries. Reading one well requires **context**, **humility** and **attention to the living community** that holds it.

Context means asking when, where and for whom a text was written, and how it has been interpreted within its own tradition. Humility means accepting that a translation is always an interpretation, and that an outsider's first reading rarely captures what a lifelong practitioner hears.

A good method is to read slowly and repeatedly, in the spirit of the contemplative practice many traditions share: read, reflect, respond, rest. Ask what the passage invites, not only what it says.`,
            practice: "Read a short passage from a tradition other than your own three times, slowly, a day apart. After each reading, note one word or phrase that stays with you.",
            action: "Find a reputable introduction written by a member of that tradition and read it. Notice where it changed your first impression.",
          },
        ],
      },
      {
        title: "Paths",
        lessons: [
          {
            title: "Paths of devotion",
            durationMin: 24,
            body: `For many people, the spiritual life is above all a relationship of love: with God, the divine, the sacred, or a teacher who points beyond themselves. Devotional paths appear across the world, in bhakti in the Hindu traditions, Sufi poetry in Islam, the Psalms, the Christian mystics and countless folk practices.

Devotion often works through the heart and the senses: song, chant, prayer, pilgrimage, service. Its gift is warmth and humility, and its central teaching is often that love expressed as service is the truest worship.

Approach these practices as a respectful guest. You may find that something in them speaks to you; you may simply come to understand why they matter so much to others.`,
            practice: "Listen attentively to one piece of devotional music from an unfamiliar tradition, start to finish, without doing anything else.",
            action: "Offer an act of service this week as an expression of gratitude, whatever gratitude means in your own framework.",
          },
          {
            title: "Paths of knowledge and inquiry",
            durationMin: 24,
            body: `Other paths emphasise inquiry: careful questioning about the nature of the self, reality and the mind. Examples include Socratic dialogue, the self-inquiry of Advaita Vedanta, the analytical meditation of Tibetan Buddhism, and the contemplative philosophy of the Neoplatonists.

These paths ask you to examine, not merely believe. That fits a principle of this school: students should *examine, experience, reflect upon and apply* what they learn.

Inquiry and devotion aren't opposites. Many teachers held both: rigorous questioning balanced by love and humility.`,
            practice: "Spend ten minutes with the question 'Who is aware right now?' Don't answer it with words; simply look.",
            action: "In a disagreement this week, ask one genuine question to understand the other view before stating your own.",
          },
        ],
      },
      {
        title: "Dialogue",
        lessons: [
          {
            title: "Finding shared ground",
            durationMin: 20,
            body: `Real dialogue is not debate. In debate, I listen for weaknesses so I can win. In dialogue, I listen for meaning so I can understand. Neither side has to agree, and no one has to give up their convictions.

Shared ground is often found not in doctrine but in **practice and value**: hospitality to the stranger, care for the poor, honesty, the discipline of prayer or meditation, reverence for life.`,
            practice: "Make a list of five values you hold. Next to each, write a tradition other than your own that also honours it.",
            action: "Share one thing you admire about another tradition with a member of that tradition, sincerely and specifically.",
          },
          {
            title: "Hosting an interfaith conversation",
            durationMin: 28,
            body: `Bringing people together across traditions is one of the most beautiful contributions a student of this school can make, and one of the most delicate.

Good hosting starts with clear agreements: speak from your own experience ("I" rather than "they believe"), listen to understand, no attempts to convert, confidentiality, and the right to pass. A simple shared question works better than a grand theme, for example: *What does your tradition teach about welcoming strangers?*`,
            practice: "Draft the agreements and the opening question for a small gathering of four to eight people.",
            action:
              "Host the conversation, in person or as a gathering in the community. Afterwards, share what you learned (never what others confided) in the Spiritual Wisdom circle.",
          },
        ],
      },
    ],
  },
  {
    slug: "sacred-geometry",
    title: "Sacred Geometry & Symbolism",
    subtitle: "The patterns beneath nature and tradition",
    description:
      "A hands-on course in the shapes that recur in nature, architecture and sacred art: the circle, the vesica piscis, the flower of life and the golden ratio. You'll draw them yourself with compass and straightedge, explore what they have meant to different cultures, and learn to tell well-founded claims from popular myths.",
    studyArea: "sacred-geometry",
    level: "intermediate",
    priceCents: 9900,
    teacherName: "Elena Vasquez",
    teacherBio: "Elena is an architect and geometric artist who teaches traditional compass-and-straightedge drawing.",
    durationLabel: "6 weeks · about 2 hours a week",
    outcomes: [
      "Construct key figures with a compass and straightedge",
      "Explain the symbolic meanings different cultures gave them",
      "Separate well-founded patterns in nature from popular myths",
      "Use geometric drawing as a contemplative practice",
    ],
    modules: [
      {
        title: "The circle and its children",
        lessons: [
          {
            title: "The point and the circle",
            durationMin: 18,
            preview: true,
            body: `Every geometric construction in this course begins the same way: a point, and a circle drawn around it. Many cultures have read deep meaning into this simplest of figures: unity, wholeness, the source from which multiplicity unfolds.

Geometry offers a rare meeting place between precise thought and contemplation. A compass doesn't care what you believe; the circle is exact. Yet drawing it slowly, with full attention, is a meditative act that craftspeople in many traditions have valued.

You'll need a compass, a straightedge, a sharp pencil and good paper. No measuring. Classical geometry works with proportion, not numbers.`,
            practice: "Draw a single circle, slowly, with full attention. Then draw a second circle of the same radius centred on a point of the first. Notice the shape that appears where they overlap.",
            action: "Look for circles in the built world around you this week. Photograph three that seem to have been made with care, and share them in the circle.",
          },
          {
            title: "The vesica piscis",
            durationMin: 20,
            body: `Two equal circles, each passing through the other's centre, create an almond-shaped overlap called the *vesica piscis*. From it you can construct an equilateral triangle, a hexagon, and the square root of three.

The figure appears in medieval Christian art and architecture, in the frames of many cathedral windows and seals. It has been read as a symbol of meeting: two worlds overlapping to create something new.

Here we practise an important habit: **hold symbolic interpretations as interpretations**. The geometry is certain; the meanings are human, and they vary.`,
            practice: "Construct the vesica piscis, then use it to draw an equilateral triangle. Notice how one relationship generates another.",
            action: "Think of two groups in your life that rarely meet. What might their 'overlap' be? Write down one way you could help create it.",
          },
        ],
      },
      {
        title: "Patterns in nature",
        lessons: [
          {
            title: "The golden ratio: fact and fable",
            durationMin: 24,
            body: `The golden ratio (about 1.618) has a famous reputation. Some of it is earned: the arrangement of seeds in a sunflower head and scales on a pine cone often follow Fibonacci numbers, whose ratios approach the golden ratio, because that spacing packs elements efficiently as a plant grows.

Some of the reputation isn't earned. Claims that the Parthenon, the Mona Lisa or the "perfect face" were designed on the golden ratio are disputed or unsupported by careful measurement.

A genuine mystical school encourages students to *examine*. Wonder is stronger, not weaker, when it rests on what is actually true.`,
            practice: "Find a sunflower head, pine cone or pineapple (or a good photograph). Count the spirals running in each direction. Are they neighbouring Fibonacci numbers?",
            action: "When you next see a striking claim about sacred geometry, look for a careful source before sharing it. Share the source, not just the claim.",
          },
          {
            title: "The flower of life across cultures",
            durationMin: 20,
            body: `Overlapping circles arranged in a hexagonal pattern, now popularly called the flower of life, appear in decorative art in many times and places, including Roman mosaics and medieval European and Islamic ornament.

The modern name and many of the spiritual meanings attached to it are relatively recent. That doesn't make the pattern less beautiful. It invites us to appreciate both the ancient human love of pattern and the way each generation finds new meaning in it.`,
            practice: "Construct the seed of life (seven circles), then extend it towards the flower of life. Work slowly; allow it to take an hour.",
            action: "Teach someone younger to draw the seed of life. Notice what they see in it.",
          },
        ],
      },
      {
        title: "Geometry as practice",
        lessons: [
          {
            title: "Drawing as meditation",
            durationMin: 16,
            body: `Precise drawing demands precise attention. Slips of the compass reveal a wandering mind more honestly than any meditation timer. Many students find geometric drawing the most natural meditation they've ever tried.

Set a regular time, clear your table, and draw one figure from beginning to end without hurrying. Let accuracy be a form of respect.`,
            practice: "Draw for twenty minutes without music or interruptions. When you notice the mind wandering, let the next line be the return.",
            action: "Leave a finished drawing somewhere it can lift someone's day: a noticeboard, a hospital waiting room, a friend's door.",
          },
          {
            title: "Designing with meaning",
            durationMin: 22,
            body: `In the final lesson you'll design a small piece of your own: a pattern for a card, a garden bed, a tile, a logo for a community project. Choose your figures deliberately and be ready to explain why.

Beauty made with care is a form of service. Spaces and objects that are well-proportioned and thoughtfully made affect how people feel in them.`,
            practice: "Design a pattern using at least two constructions from this course. Write two sentences on what each part means to you.",
            action: "Offer your design to a Wisdom in Action project in the community that could use it.",
          },
        ],
      },
    ],
  },
  {
    slug: "conscious-leadership",
    title: "Conscious Leadership",
    subtitle: "Leading through service, wisdom and integrity",
    description:
      "For founders, managers, educators and community leaders who want to lead with wisdom as well as results. Explore service-based leadership, the ripple effects of decisions, responsible use of wealth and influence, and the ethical entrepreneur, then commit to a concrete change in how you lead.",
    studyArea: "ethics",
    level: "advanced",
    priceCents: 14900,
    teacherName: "Marcus Bell",
    teacherBio:
      "Marcus led social enterprises for twenty years and now mentors founders on ethical decision-making and stewardship.",
    durationLabel: "6 weeks · about 3 hours a week",
    outcomes: [
      "Practise leadership as service rather than domination",
      "Consider the human consequences of decisions before you make them",
      "Use wealth and influence responsibly",
      "Make a public commitment to one change in how you lead",
    ],
    modules: [
      {
        title: "The heart of leadership",
        lessons: [
          {
            title: "Leading through service",
            durationMin: 25,
            preview: true,
            body: `Imagine if business leaders, politicians, educators and entrepreneurs were guided not only by success or ambition, but also by wisdom, integrity, compassion and responsibility. That is the leadership this course is about.

Service-based leadership has deep roots: in the image of the leader who washes others' feet, in the Taoist ruler who governs so lightly that people say "we did it ourselves," and in many Indigenous traditions where leadership is a burden carried for the community.

The core shift is a question. Instead of *"How do I get people to do what I need?"*, ask *"What do the people I lead need in order to flourish and do their best work?"*`,
            practice: "List the people you lead or influence. Beside each name, write what you believe they most need from you right now. Then ask two of them directly.",
            action: "Remove one obstacle for someone you lead this week, without being asked and without announcing it.",
          },
          {
            title: "Decisions and their ripples",
            durationMin: 24,
            body: `Every significant decision sends ripples beyond the people in the room: to families, communities, future colleagues and the environment. Conscious leaders slow down long enough to see them.

A practical tool is the **ripple map**: write the decision in the centre, then the people directly affected, then those affected by *them*, then the wider community and the natural world.`,
            practice: "Draw a ripple map for a decision you face now. Mark any ripple you hadn't considered before.",
            action: "Speak to one person in an outer ripple before you decide. Let their perspective count.",
          },
        ],
      },
      {
        title: "Power and prosperity",
        lessons: [
          {
            title: "Wealth and influence, responsibly",
            durationMin: 22,
            body: `Wealth and influence are not evil. They are capacities, and capacities carry responsibility. We can accumulate wealth, but we must also understand our responsibility towards those who are less fortunate.

This lesson explores stewardship: holding resources in trust for a purpose larger than ourselves.`,
            practice: "Review how you used your money and influence last month. What did they serve? What would you like them to serve?",
            action: "Redirect one resource (an hour, an introduction, a sum of money) to someone with less access than you.",
          },
          {
            title: "Prosperity and well-being in balance",
            durationMin: 22,
            body: `An organisation can hit every target while burning out its people and harming its surroundings. Conscious leaders measure success in two currencies: results and human well-being.`,
            practice: "Choose one metric of well-being for your team or community, and decide how you'll notice it honestly.",
            action: "Make one change this month that protects people's well-being even if it costs a little efficiency.",
          },
        ],
      },
      {
        title: "Leadership in action",
        lessons: [
          {
            title: "The ethical entrepreneur",
            durationMin: 26,
            body: `Ethical entrepreneurs build businesses that generate prosperity while contributing to society. They design ethics into the model rather than adding charity at the end: fair supply chains, honest marketing, products that genuinely help.`,
            practice: "Audit one product, service or project you're responsible for. Where does it create value, and where might it quietly cause harm?",
            action: "Fix one small harm you found, and tell your team why.",
          },
          {
            title: "Your leadership commitment",
            durationMin: 20,
            body: `Close the course by writing one leadership commitment, specific enough that the people you lead would notice the difference within a month. Share it with them. Accountability is a gift you give your own integrity.`,
            practice: "Write your commitment in a single sentence starting 'From now on, I will…'",
            action: "Share your commitment with at least one person you lead and ask them to tell you honestly how you're doing in a month.",
          },
        ],
      },
    ],
  },
  {
    slug: "harmony-with-nature",
    title: "Harmony with Nature",
    subtitle: "Interconnectedness as a daily practice",
    description:
      "Many wisdom traditions teach that humanity is not separate from the natural world. This course turns that insight into practice: attention outdoors, cause and effect in living systems, simplicity, and a stewardship project of your own in your community.",
    studyArea: "universal-principles",
    level: "foundation",
    priceCents: 7900,
    teacherName: "Grace Mwangi",
    teacherBio:
      "Grace is an ecologist and community organiser who has led tree-planting and watershed projects across East Africa.",
    durationLabel: "5 weeks · about 2 hours a week",
    outcomes: [
      "Experience interconnectedness through direct attention",
      "Understand cause and effect in living systems",
      "Simplify one area of your consumption",
      "Start a small stewardship project with others",
    ],
    modules: [
      {
        title: "We are part of it",
        lessons: [
          {
            title: "Interconnectedness",
            durationMin: 18,
            preview: true,
            body: `Breathe in. Part of the oxygen in that breath was released by plants and algae, some of them oceans away. Breathe out, and the carbon you release will be taken up by living things you will never meet. Interconnectedness isn't a metaphor; it's how life works.

Many traditions express this as kinship: with rivers, mountains, animals and plants. Modern ecology describes it as networks of relationship. The two languages illuminate each other.

When we truly feel this, environmental responsibility stops being a duty imposed from outside. It becomes care for our own extended body.`,
            practice: "Sit outdoors for fifteen minutes, even in a city. Count how many living things you can notice: plants, birds, insects, people. Notice how they depend on each other.",
            action: "Learn the name of one tree, plant or bird near your home, and tell someone about it.",
          },
          {
            title: "Cause and effect in living systems",
            durationMin: 20,
            body: `In nature, no action is isolated. Remove a predator and grazing animals multiply; the plants they eat decline; riverbanks erode. Ecologists call these chains of effects *trophic cascades*.

The universal principle of cause and effect, found in many traditions, gains depth when we see it play out in ecosystems. Small, consistent actions accumulate, for harm or for healing.`,
            practice: "Trace one everyday object (a cup of coffee, a T-shirt) back through every step of its making. Note each living system it touched.",
            action: "Change one habit based on what you discovered, and keep it for thirty days.",
          },
        ],
      },
      {
        title: "Living lightly",
        lessons: [
          {
            title: "Attention outdoors",
            durationMin: 16,
            body: `Walking slowly, listening deeply and returning to the same place across the seasons are among the simplest and most transforming practices. They train patience and wonder, and they reveal change we usually miss.`,
            practice: "Choose a 'sit spot' near home and visit it for ten minutes, three times this week. Note what changes.",
            action: "Take someone with you to your sit spot and share one thing you've noticed there.",
          },
          {
            title: "Simplicity and waste",
            durationMin: 18,
            body: `Simplicity is not deprivation. It's a clearing-away of excess so that what matters can be seen. Reducing waste is one of the most direct ways to honour interconnectedness.`,
            practice: "For one week, notice everything you throw away. Write it down without judgement.",
            action: "Choose the largest category in your list and find one way to reduce it, ideally together with your household or workplace.",
          },
        ],
      },
      {
        title: "Stewardship",
        lessons: [
          {
            title: "Community action for the earth",
            durationMin: 20,
            body: `Individual change matters, and collective change multiplies it. Tree planting, litter clean-ups, community gardens, repair cafés and water conservation projects all turn care into visible results, and they build friendships along the way.`,
            practice: "Map three environmental initiatives near you. Visit or contact one.",
            action: "Join or support one local initiative this month.",
          },
          {
            title: "Your stewardship project",
            durationMin: 22,
            body: `To close the course, design a small stewardship project you can run with at least two other people. Keep it modest, local and repeatable. The community's Wisdom in Action projects are a good place to find collaborators.`,
            practice: "Write a one-paragraph project description: what, where, with whom, and how you'll know it helped.",
            action: "Post your project in the community's Wisdom in Action projects and invite others to join.",
          },
        ],
      },
    ],
  },
];
