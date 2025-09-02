# Task Completion Checklist

Run locally before marking a task complete:

- Format: `npm run format` (root) and ensure minimal diffs.
- Lint: `npm run lint` and address all errors (Prettier violations are errors).
- Type check: `npm run build` (ensures TS compiles) or `tsc -p tsconfig.json` if configured.
- Unit tests: `npm test` should pass locally.
- E2E (if UI/API affected): `npm run test:e2e` (Playwright auto-starts dev server). Install browsers once via `npx playwright install`.
- API compile: `cd sanctuary-api && npm run build` (confirm no type errors).
- DB changes: If Prisma schema changed, run `cd sanctuary-api && npx prisma format && npx prisma generate && npx prisma migrate dev --name <change>` and update docs/PR.
- Env sanity: Verify `.env.local` and `sanctuary-api/.env` contain required keys; visit `/env-test` and call `GET /api/check-env` if relevant.
- Manual smoke: Start all services, create a post, verify AI moderation path (approved and rejected), and admin flows (list users, approve posts) in logs.
