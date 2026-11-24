# AGENTS.md: working on Mystical School

For AI coding agents (Claude Code, Codex and others) changing this repository.

## Layout

- `app/`: routes (Next.js App Router). Server actions live in `app/actions/`, JSON and
  streaming endpoints in `app/api/`.
- `components/`: UI. `components/ui.tsx` is the small design system; `components/geometry.tsx`
  draws all artwork (no stock images).
- `lib/`: domain logic. `db/schema.ts` (Drizzle, SQLite), `auth/`, `guide/` (Sophia),
  `voice/`, `video/`, `payments.ts`, `retreats.ts`, `courses.ts`, `community.ts`,
  `plans.ts` (tiers, limits and prices: the only place to change them).
- `scripts/`: migrate, seed (sample content in `scripts/seed-data/`), reset, Tavus persona.
- `tests/`: `node:test` suites run through tsx.
- `docs/PLAN.md`: the build plan and decisions. `remaining_work.md`: open work.

## Next.js version

This is Next.js 16, which differs from older versions (async `params`, `searchParams` and
`cookies()`; Turbopack by default). Version-matched docs ship in
`node_modules/next/dist/docs/`. Read them before relying on memory.

## Commands

Node 22.13 or later. `npm run dev`, `npm run setup`, `npm test`, `npm run typecheck`.
After changing `lib/db/schema.ts`, run `npm run db:generate` and commit the migration.

## Rules

1. **Check permissions on the server**, in every page, route handler and server action.
   Never rely on a layout or the UI alone.
2. **Never put keys in client code.** Provider keys stay on the server; the browser gets
   short-lived tokens only (Gemini Live tokens, Tavus conversation URLs).
3. **Never log message content** from Sophia's conversations or the journal. Log ids and
   flags only.
4. **Sophia's safety rules** (`lib/guide/prompt.ts`, `lib/guide/safety.ts`) are product
   requirements. Changes need a test in `tests/safety.test.ts` and a CHANGELOG entry.
5. **Money and places**: any change to `lib/payments.ts` or `lib/retreats.ts` must keep
   fulfilment idempotent and capacity checks inside a transaction, with tests.
6. **Outward actions need the owner's approval**: creating the Tavus persona, enabling
   SmartMeet (it writes to production smartmeet.org), and anything that sends messages or
   spends money.
7. **Maintain `CHANGELOG.md`** (dated, newest first) and **`remaining_work.md`**.
8. Keep the design consistent: tokens in `app/globals.css`, components in
   `components/ui.tsx`, light and dark themes, mobile first.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
