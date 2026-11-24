# Mystical School platform: build plan

Written 24 November 2026, before implementation. Source brief: `Mystical School.pdf`
(seven pages: four platform components, the school's philosophy, vision, mission,
values, and the "Mystical Wisdom in Action" principle, with Kenneth's note on
SmartMeet for the community).

## 1. What we are building

A local-first web platform for a Mystical School with four parts, exactly as the brief
lists them:

1. **Sophia, the spiritual guide (avatar).** An AI guide that supports each member's
   spiritual evolution, in a free and a paid version. Three ways to talk: text, live
   voice, and face-to-face video.
2. **Courses.** Paid courses from the school, with lessons, practices and a progress
   record.
3. **Retreats.** Booking for in-person retreats, with real capacity limits.
4. **Community.** Members meet each other in circles, collaborate on "Wisdom in Action"
   projects, and gather live through SmartMeet (Kenneth's suggestion).

The brief's organising idea runs through all four: **every insight should become a
practice, and every practice a contribution** ("Mystical Wisdom in Action"). Concretely:

- Every lesson has a *practice* and a *Wisdom in Action* prompt.
- Sophia ends guidance with something to try, not only something to know.
- Community projects are where members apply what they learn for others.

### Who uses it

| Person | Needs |
|---|---|
| Seeker (free member) | Try the guide, browse courses and retreats, join the community |
| Initiate (paid member) | Deeper guidance with memory, voice and video sessions |
| Student | Buy a course, work through lessons, record reflections |
| Retreat guest | See dates, rooms and what's included, pay a deposit, manage the booking |
| School admin | See members, orders, bookings and reports; moderate the community |

### Out of scope for this local build (recorded in `remaining_work.md`)

Hosting, real payments (Stripe), transactional email, a content editor for courses and
retreats, Postgres, internationalisation, native mobile apps.

## 2. Decisions and why

| Decision | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router), React 19.3, TypeScript 5.9 | Matches the React 19 + Tailwind 4 + lucide stack in `D:\uain`. I used plain Next.js, not uain's Vinext: Vinext targets Cloudflare Workers, and this app needs a local Node server with a database and streaming. |
| Styling | Tailwind CSS 4, own small component set, lucide icons | Same as uain; no heavy UI kit |
| Database | SQLite (better-sqlite3) with Drizzle ORM | No Docker on this machine; one file, zero setup. Drizzle supports Postgres later. |
| Auth | Email + password (scrypt), sessions stored in the database, httpOnly cookie | No third-party identity provider is needed locally; permissions are checked on the server for every request |
| Text guide | OpenRouter → `anthropic/claude-haiku-5.5` (free), `anthropic/claude-sonnet-5.5` (paid) | Key works. Haiku costs $0.10 / $0.50 per million tokens, so the free tier is cheap to run. |
| Voice guide | Gemini Live (`gemini-3.8-live`), browser ↔ Google over WebSocket with a **constrained, single-use ephemeral token** minted by our server | Verified working on 24 Nov 2026. The token locks the model and system prompt, so the browser never holds the API key and can't change Sophia's instructions. |
| Video guide | Tavus CVI conversation embedded in the page | The only avatar provider with a working key. It needs a dedicated Sophia persona on the Tavus account (one command, run on approval). |
| Avatar when not on video | Animated sacred-geometry "presence" that breathes and responds to Sophia's voice | Honest (no fake human), cheap, works for every tier, and fits the subject (sacred geometry is one of the school's subjects) |
| Payments | `local-test` provider with a clearly labelled test checkout | No payment keys exist; no real money can move. Stripe slots in behind the same interface. |
| Community live sessions | SmartMeet external API (`POST /meetings` → `joinUrl`), **off by default** | When on, it creates real meetings on production smartmeet.org and can send emails, so it stays off until approved. Off, hosts can attach their own meeting link. |
| Keys | Only what the app uses, in `.env` (gitignored); `.env.example` documents the names | Least privilege |

Rejected keys (checked 24 Nov 2026): both OpenAI keys on the server
(`invalid_api_key`) and all three Simli keys (`INVALID_API_KEY`). So there is no OpenAI
Realtime and no Simli lip-sync, which is SmartMeet's own default.

## 3. Free and paid

All numbers live in one file (`lib/plans.ts`) so the school can change them. Prices are
placeholders until the school sets them.

| | Seeker (free) | Initiate (paid, placeholder $19/month or $190/year) |
|---|---|---|
| Text guidance | 15 messages a day, Haiku | 200 a day (fair use), Sonnet |
| Journey memory | Intention and focus areas only | Sophia keeps a running summary of your journey |
| Voice sessions | 5 minutes a day | 60 minutes a day |
| Face-to-face video | — | 30 minutes a month |
| Community | Full access | Full access |
| Courses, retreats | Bought separately | Bought separately |

Limits are enforced on the server before any provider call.

## 4. Sophia's safety and ethics

Written into the system prompt and the server code, not left to the model alone:

- She says she is an AI guide. She is not a guru, therapist, doctor or oracle, and makes
  no supernatural claims.
- She respects every tradition and never asks anyone to leave their own (brief, page 4).
- **Crisis handling.** The server screens each message for self-harm, suicide, abuse
  and medical emergencies. When something matches, the page shows a card with
  help resources and Sophia is told to answer with care and point the person to
  human help. The match is recorded as a flag, never by logging what was said.
- No medical, legal or financial advice dressed as spiritual guidance. Energy practices
  are never presented as a replacement for medical care.
- No upselling in vulnerable moments. Sophia never pitches the paid plan; the interface
  shows limits plainly.
- She builds independence, not dependency, and points people to practice, community and
  human teachers (brief, page 6: humble, not "more spiritually advanced than others").
- Privacy: conversations stay in the local database. Members can delete their history.
  Message content never goes into server logs.

## 5. Architecture

```
Browser ──► Next.js (app/ pages, server actions, route handlers)
               │
               ├─ lib/auth        sessions, password hashing, role checks
               ├─ lib/db          Drizzle schema, SQLite file in data/
               ├─ lib/plans       tiers, limits and prices (one source of truth)
               ├─ lib/usage       quota checks and metering
               ├─ lib/guide       prompts, safety screen, memory, OpenRouter client
               ├─ lib/voice       Gemini Live ephemeral token minting
               ├─ lib/video       Tavus conversations
               ├─ lib/payments    provider interface + local-test provider, fulfilment
               ├─ lib/retreats    availability and holds (transactions)
               └─ lib/smartmeet   gathering adapter (SmartMeet or own link)

Voice:  browser mic ─PCM16 16k─► Gemini Live WS ─PCM16 24k─► speakers + presence animation
          ▲ token from POST /api/guide/voice/session (auth + quota + locked prompt)
Video:  POST /api/guide/video/session → Tavus conversation_url → embedded call
Text:   POST /api/guide/chat → OpenRouter stream → streamed to the page, saved on completion
```

### Data model (SQLite)

- **People:** `users`, `sessions`, `journeys` (intention, focus areas, traditions,
  experience, memory summary)
- **Membership:** `subscriptions`, `orders` (one table for every purchase, with
  idempotent fulfilment), `usage_events`
- **Guide:** `guide_conversations`, `guide_messages` (with a safety flag),
  `journal_entries`, `voice_sessions`, `video_sessions`
- **Courses:** `courses`, `course_modules`, `lessons`, `enrollments`, `lesson_progress`
- **Retreats:** `retreats`, `retreat_rooms`, `bookings` (status, 30-minute hold,
  amounts)
- **Community:** `circles`, `circle_members`, `posts`, `comments`, `reactions`,
  `projects`, `project_members`, `project_updates`, `gatherings`, `gathering_rsvps`,
  `reports`
- **Operations:** `audit_log` (payments, bookings, moderation, role changes)

## 6. Design direction

Quiet, warm and precise, like a well-made book rather than a crystal shop.

- **Type.** Cormorant Garamond for headings, Figtree for reading and interface text.
- **Colour.** Parchment and ink by day, deep night indigo after dark, one gold accent
  used sparingly, sage for success. Light and dark themes.
- **Imagery.** No stock photos. Course and retreat art is generated from sacred-geometry
  line drawings (seed of life, vesica piscis, Metatron's cube…), one per study area. It
  is consistent, light, and part of what the school teaches.
- **Layout.** Generous whitespace and clear hierarchy, with one primary action per
  screen. Every list has designed empty, loading and error states. Mobile first.
- **Sophia's presence.** A slow-breathing geometric mandala that listens, thinks and
  speaks visibly.

## 7. Phases

Each phase ends with a type check, the tests for that phase, and a manual check in the
browser.

| Phase | Scope | Done when |
|---|---|---|
| 0. Foundations | Repo conventions (README, AGENTS.md, CLAUDE.md, CHANGELOG, remaining_work), `.env`, design system, layout and navigation, DB schema and migrations, seed content, auth (sign up, sign in, sign out), onboarding | You can sign up, finish onboarding and land on a home page that knows you |
| 1. Sophia | Text chat with streaming, quotas and memory; safety screen; journal; live voice (Gemini) with presence animation and transcripts; video (Tavus) behind its persona setting; membership page and upgrade through test checkout | Real conversations with Sophia in text and voice; free limits enforced; upgrade unlocks paid features |
| 2. Courses | Catalogue, course page, test checkout, enrolment, lesson player with practice and Wisdom in Action reflection, progress | Buy a course, complete lessons, see progress |
| 3. Retreats | Listing, detail with itinerary and rooms, booking with holds and capacity, deposit or full payment, my bookings, cancellation | Book a room and watch availability fall; overbooking impossible |
| 4. Community | Circles with posts, comments and reactions; member profiles; Wisdom in Action projects; gatherings (SmartMeet adapter or own link); reporting | Members can post, join a project and schedule a gathering |
| 5. Admin and hardening | Admin overview, orders, bookings, members, moderation queue; unit tests for limits, availability, fulfilment and safety; accessibility and responsive pass | Tests pass; every page checked at phone and desktop width |

## 8. Risks and open questions

- **Prices, limits and the guide's name** are placeholders until the school decides.
- **Tavus video costs per minute** and the account is shared with SmartMeet and AGA.
  Creating a Sophia persona needs approval. Video is paid-only with a monthly cap.
- **Gemini Live models are previews** and may change; the model name is in `.env`.
- **SmartMeet integration writes to production** smartmeet.org. It stays off until
  approved, and when on it never sends email or WhatsApp invitations from local tests.
- **Course and retreat content is sample content** written for this build, based on the
  brief's subjects. The school should replace it.
- **AI guidance on spiritual matters can be wrong or land badly.** The safety measures
  above reduce the risk. A human review of the guide's prompt by the school's teachers
  is recommended before launch.
