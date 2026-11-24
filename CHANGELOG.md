# Changelog

Newest first.

## 2026-11-24: face-to-face video switched on

- Created Sophia's persona on the Tavus account with the owner's approval
  (`npm run tavus:persona -- --yes`, persona `pb0d58eab702`), and set her replica to the
  stock "Lucy - Home" (`r4067604db72`) instead of SmartMeet's "Daniel - Office".
- Verified: the Initiate upgrade through test checkout; a Tavus video session created by
  the app on tavus.daily.co and ended after 7 seconds (metered); a crisis message flagged
  `self_harm` and answered with care and help resources by the paid model.

## 2026-11-24: first local build

- Created the project from the "Mystical School" brief. Plan and decisions in
  `docs/PLAN.md`.
- **Foundations:** Next.js 16, React 19, Tailwind 4, SQLite with Drizzle; email and
  password accounts with hashed database sessions; onboarding (intention, focus areas,
  experience, traditions); design system with sacred-geometry artwork, light and dark
  themes.
- **Sophia:** streaming text guidance (Claude Haiku 5.5 free / Sonnet 5.5 paid via
  OpenRouter) with member context, a crisis safety screen and resources, journey memory
  for Initiates, save-to-journal; live voice through Gemini Live with single-use tokens
  that lock the prompt server-side, an animated presence and saved transcripts; Tavus
  face-to-face video behind the paid plan and a persona setting.
- **Membership:** Seeker (free) and Initiate plans, server-side quotas, test checkout.
- **Courses:** catalogue, course pages, free preview lessons, purchase, lesson player
  with practice, Wisdom in Action step, reflections and progress. Six sample courses.
- **Retreats:** listings, details, booking with 30-minute holds, deposit or full payment,
  balance payment and cancellation, without overbooking. Four sample retreats.
- **Community:** circles, posts, replies, resonates, reporting; Wisdom in Action
  projects with members and updates; gatherings with RSVP and a SmartMeet adapter (off
  by default).
- **Account and admin:** profile, intention, membership, payments, bookings, delete
  conversations, delete account; admin overview, bookings, members and moderation.
- **Tests:** 16 tests for the safety screen, retreat capacity and holds, payment
  fulfilment and plan limits. The first run found two bugs, both fixed: the screen
  missed "my husband hits me", and a failed payment on a lapsed hold didn't record its
  cancellation.
- **Verified locally:** type check, 16/16 tests and `next build` pass. In the browser:
  sign-in, onboarding context reaching Sophia, a streamed Sophia reply, a Gemini Live
  voice token accepted by Google (`setupComplete`, 5 s metered), course purchase and
  lesson completion with a journal reflection, a retreat deposit booking, a community
  post, a gathering with time-zone round-trip, reporting and moderation, admin access
  refused to members, and API guards (403 cross-origin, 401 signed out). All 21 main
  pages render at 375 px wide without horizontal overflow.
- **Keys:** copied OpenRouter, Tavus and SmartMeet keys from `meeting-suite` and the
  Gemini key from `AI-Academy-1` on the universa-and-others server into the local `.env`.
  OpenAI and Simli keys there were rejected by their APIs and were not used.
