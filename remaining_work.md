# Remaining work

The register of unfinished work. Add items as you find them; tick them with evidence and
a date when verified.

## Needs a decision or approval from the school

- [ ] **Prices and plan limits.** `lib/plans.ts` holds placeholders ($19/month, $190/year;
      15 messages and 5 voice minutes a day free).
- [ ] **Guide name and voice.** "Sophia" and Gemini voice "Aoede" are proposals.
- [x] **Create Sophia's Tavus persona.** Done 24 Nov 2026 with approval: persona
      `pb0d58eab702`, replica "Lucy - Home". A 7-second test session worked. Calls are
      billed per minute on the shared Tavus account.
- [ ] **Choose Sophia's look.** The replica was picked by name only; review it on
      Tavus and change `TAVUS_REPLICA_ID` if another face suits better.
- [ ] **SmartMeet for gatherings.** Turning on `SMARTMEET_ENABLED` creates real meetings
      on production smartmeet.org with SmartMeet's shared external API key. Better:
      register Mystical School as its own SmartMeet platform client and use that key.
- [ ] **Real course and retreat content** to replace the sample material in
      `scripts/seed-data/`, and a review of Sophia's prompt by the school's teachers.
- [ ] **Replace the revoked keys** if OpenAI or Simli are wanted: every OpenAI and Simli
      key on the universa-and-others server was rejected on 24 Nov 2026.

## Before hosting

- [ ] Real payments: a Stripe provider behind `lib/payments.ts` (checkout session +
      webhook calling `fulfilOrder`), refunds for retreat cancellations, receipts.
- [ ] Transactional email: verification, password reset, booking confirmations,
      gathering reminders. (There is no password reset yet.)
- [ ] Postgres instead of SQLite; move the in-memory rate limiter to a shared store.
- [ ] Content management for courses, lessons and retreats (today they are seeded).
- [ ] Security review: CSP header, session rotation, account lockout policy, audit of
      admin actions, privacy policy and terms, data retention for transcripts.
- [ ] Observability: error tracking and provider cost monitoring (OpenRouter, Gemini,
      Tavus).

## Product follow-ups

- [x] Show gathering times in the member's time zone on `/home` (done 25 Nov 2026).
- [ ] Course completion certificates and a "Wisdom in Action" record across courses.
- [ ] Notifications for replies, project updates and gathering reminders.
- [ ] Voice and video with a real microphone and camera in Chrome, Safari and Firefox.
      Verified 25 Nov 2026: the full voice pipeline with a recorded clip as the mic, and
      the silent-input warning. Tavus rooms are created and ended. Verify microphone hardware and
      an actual Gemini reply after the browser audio changes.
- [ ] Accessibility audit with a screen reader.
