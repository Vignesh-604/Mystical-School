# Mystical School

A local-first platform for a Mystical School: Sophia (an AI spiritual guide with text,
voice and video, free and paid tiers), paid courses, in-person retreat booking, and a
community with circles, Wisdom in Action projects and SmartMeet gatherings.

Read `AGENTS.md` for layout and rules, `docs/PLAN.md` for decisions, and
`remaining_work.md` for open work.

## Commands

- `npm run dev`: the app on http://localhost:3000 (migrates first)
- `npm run setup`: migrate and seed the SQLite database in `data/`
- `npm test` and `npm run typecheck`
- `npm run db:generate` after editing `lib/db/schema.ts`

Test accounts are in `.env` (`SEED_MEMBER_*`, `SEED_ADMIN_*`). Payments are simulated
(`PAYMENTS_PROVIDER=local-test`).
