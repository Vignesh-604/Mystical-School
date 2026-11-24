# Changelog

Newest first.

## 2026-11-25: motion, responsive fixes and a new logo

- **Mobile menu fixed.** The header's backdrop blur trapped the fixed-position menu inside
  the header, so page content showed through. The menu now renders through a portal into
  `<body>` as a full-screen sheet with cascading links.
- **Light theme by default.** The site followed the system theme, so dark-mode systems saw
  the green evening palette. Light is now the default everywhere; dark is opt-in from the
  footer switch.
- **New logo:** a six-petal rosette from overlapping circles, the classic sacred-geometry
  flower. It blooms in on load and turns on hover; the tab icons are regenerated.
- **Motion:**
  - Hero: the photo drifts and parallaxes, with light motes on canvas that part around
    the pointer, a pointer-following glow, and the headline rising line by line.
  - Across the site: scroll reveals, header photos that open with a wipe, course emblems
    that draw themselves, a moving values band, doorway cards that tilt with glare,
    ripple rings, a floating book cover, button shine, and page-enter transitions.
  - All of it respects reduced-motion settings, and the canvas pauses off-screen.
- Verified: no horizontal overflow on 11 pages at 375px and 4 at 820px; the mobile menu
  sits above the page; type check, 16 tests and the production build pass.

## 2026-11-25: new design, logo, and the voice microphone fix

- **Voice fix.** Members' voice sessions saved Sophia's greeting but none of their words.
  Sending recorded speech straight to Gemini Live worked, so the fault was the browser
  microphone delivering silence (wrong input or Windows privacy), with nothing on screen
  to show it. The voice panel now:
  - starts audio inside the click;
  - meters the mic from the moment it opens;
  - has "Test microphone" (no session started) and an input picker;
  - warns when an input sends pure silence;
  - explains that the Claude preview pane blocks microphones.
- **Voice verified end to end in the browser** with a recorded clip as the microphone:
  transcribed, answered aloud, and saved. The silent-input warning was verified too.
- **Redesign.**
  - Look: a warm paper palette with forest ink, moss and one gold accent, plus a
    forest-night dark theme, set in Instrument Serif and Hanken Grotesk.
  - Pages: the five photos framed and used throughout, book-style course covers,
    photo-led retreat cards, and a new landing page, guide, home, community, auth and
    detail pages.
  - Sophia's presence is now a glowing lantern.
  - Removed the previous `edition` styles and components.
- **Logo:** a "threshold" mark (an open doorway with a point of light), served as
  `app/icon.svg`, `favicon.ico` and `apple-icon.png`.

## 2026-11-25: dark palette and voice fixes

- Replaced the green surfaces with a dark ink and plum palette, removed the theme
  control and cursor tracking, and gave display headings and buttons more room.
- Made Sophia's voice controls and status messages scrollable on short screens.
- Started browser audio during the user gesture, added a microphone level meter,
  and surfaced capture and connection failures separately from normal completion.

## 2026-11-25: visual redesign

- Rebuilt the homepage around a forest scene, a keyboard-accessible school index,
  an editorial course list and a retreat feature.
- Updated the shared color palette, navigation, footer and covers. Brought the
  same design to the main catalog, community, account entry and Sophia screens.
- Added scroll depth, image transitions and an audio-responsive Sophia mark,
  with reduced motion support.

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
