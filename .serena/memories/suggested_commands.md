# Suggested Commands

## Setup
- Node deps (root): `npm install`
- Node deps (API): `cd sanctuary-api && npm install`
- Playwright browsers: `npx playwright install`
- Python venv (AI review): `cd sanctuary-ai-review && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt`

## Environment
- Next.js `.env.local` (root):
  - `AUTH_GOOGLE_ID=...`
  - `AUTH_GOOGLE_SECRET=...`
  - `SANCTUARY_API_URL=http://localhost:3001` (optional; some routes hardcode localhost)
  - `NEXT_PUBLIC_SUPABASE_URL=...` (optional: for env test page)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...` (optional)
- Hono API `.env` (sanctuary-api/):
  - `DATABASE_URL=postgresql://sanctuary_user:sanctuary_password@localhost:5434/sanctuary?schema=public`
  - `GEMINI_API_KEY=...`
  - `AI_REVIEW_API_URL=http://localhost:8000` (only if using Python service)

## Database (Docker + Prisma)
- Start Postgres + pgAdmin: `cd sanctuary-api && docker compose up -d`
- Prisma client + migrate: `cd sanctuary-api && npx prisma generate && npx prisma migrate dev --name init`
- Reset dev DB (danger): `cd sanctuary-api && npx prisma migrate reset`

## Run
- Frontend (Next.js): `npm run dev` (http://localhost:3000)
- Backend (Hono API): `cd sanctuary-api && npm run dev` (http://localhost:3001)
- AI Review (Python): `cd sanctuary-ai-review && source venv/bin/activate && uvicorn app.main:app --reload --port 8000`

## Build & Start
- Next build: `npm run build && npm run start`
- API build: `cd sanctuary-api && npm run build && npm start`

## Lint & Format
- Lint: `npm run lint`
- Lint (fix): `npm run lint:fix`
- Format: `npm run format`
- Format check: `npm run format:check`

## Tests
- Unit/Integration (Jest): `npm test` or `npm run test:watch`
- E2E (Playwright): `npm run test:e2e`
- E2E UI mode: `npm run test:e2e:ui`
- E2E debug: `npm run test:e2e:debug`

## Utilities (macOS)
- Search code: `rg "pattern"` (ripgrep)
- View file chunk: `sed -n '1,200p' path/to/file`
- Ports in use: `lsof -i :3000` / `lsof -i :3001`
- Open browser: `open http://localhost:3000`
- Copy text: `pbcopy` / paste: `pbpaste`
