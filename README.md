# Mystical School

A platform for a school of the deeper dimensions of human life: self-knowledge,
consciousness, meditation, the world's wisdom traditions, sacred geometry and ethics,
built on the principle of **Mystical Wisdom in Action**: every insight becomes a
practice, and every practice can become a contribution to others.

It has the four parts the founding brief asks for:

| Part | What it does |
|---|---|
| **Sophia, the guide** (`/guide`) | An AI guide for each member's spiritual path, free and paid. Text chat (Claude via OpenRouter), live voice (Gemini Live), and face-to-face video (Tavus). She remembers the member's intention and, on the paid plan, keeps notes on their journey. |
| **Courses** (`/courses`) | Paid courses with lessons, a practice and a Wisdom in Action step per lesson, reflections and progress. |
| **Retreats** (`/retreats`) | In-person retreats with rooms, capacity, 30-minute holds, deposits or full payment, and cancellation. |
| **Community** (`/community`) | Circles per subject, posts, replies, "resonates", reporting, Wisdom in Action projects, and live gatherings (SmartMeet). |

Also: onboarding, a private journal, membership plans, a test-mode checkout, account and
data deletion, and an admin area (members, payments, bookings, moderation).

**Status:** local only. Payments are simulated and the content is sample material. See
[`remaining_work.md`](remaining_work.md) and [`docs/PLAN.md`](docs/PLAN.md).

## Run it

Node 22.13 or later.

```bash
npm install
cp .env.example .env      # then fill in keys and the two SEED_* passwords
npm run setup             # create the SQLite database and sample content
npm run dev               # http://localhost:3000
```

Sign in with `SEED_MEMBER_EMAIL` / `SEED_MEMBER_PASSWORD` from `.env` (a free Seeker
member), or the admin account for `/admin`.

| Command | What it does |
|---|---|
| `npm run dev` | Development server (applies migrations first) |
| `npm run setup` | Migrate and seed the database |
| `npm run db:reset` | Delete the local database, then migrate and seed again |
| `npm run db:generate` | Generate a migration after changing `lib/db/schema.ts` |
| `npm test` | Unit tests (safety screen, retreat capacity, payments, plan limits) |
| `npm run typecheck` | TypeScript |
| `npm run tavus:persona -- --yes` | Create Sophia's persona on the Tavus account (writes to Tavus) |

## How it fits together

- **Next.js 16** (App Router, React 19, server actions) with **Tailwind CSS 4**.
- **SQLite** through Drizzle ORM (`lib/db/schema.ts`, migrations in `lib/db/migrations/`).
- **Auth**: email and password (scrypt), sessions stored hashed in the database,
  httpOnly SameSite=Lax cookie. Every page and action checks permissions on the server.
- **Plans and limits** live in one file, `lib/plans.ts`; usage is metered on the server
  (`lib/membership.ts`, `lib/live.ts`).
- **Sophia**: `lib/guide/` (prompt, safety screen, OpenRouter streaming, memory),
  `lib/voice/gemini.ts` (single-use Gemini Live tokens with the prompt locked inside),
  `lib/video/tavus.ts`, and `components/guide/`.
- **Payments**: `lib/payments.ts`. One `orders` table; fulfilment is idempotent and
  transactional. Only the `local-test` provider exists.
- **Retreat availability**: `lib/retreats.ts`. Holds and confirmations run in SQLite
  transactions, so a place can't be sold twice.

## Keys

`.env` holds the keys; it is gitignored. The keys in this local copy were taken from
the universa-and-others server on 24 November 2026: OpenRouter, Tavus and SmartMeet from
`meeting-suite`, Gemini from `AI-Academy-1`. Both OpenAI keys and all Simli keys there
were rejected by their APIs, so neither provider is used.

## Turning on optional integrations

- **Face-to-face video:** on. Sophia's Tavus persona exists (`MYSTICAL_TAVUS_PERSONA_ID`);
  for a fresh setup, run `npm run tavus:persona -- --yes`. Tavus bills per minute, and
  only Initiate members can start sessions (30 minutes a month).
- **SmartMeet rooms for gatherings:** set `SMARTMEET_ENABLED=true`. This creates real
  meetings on production smartmeet.org (email and WhatsApp invitations are always off).

## Safety

Sophia is an AI, and says so. She screens messages for crisis language and shows help
resources, gives no medical or financial advice, respects every tradition, and never
sells. See `/about-sophia` in the app and `lib/guide/prompt.ts`.
