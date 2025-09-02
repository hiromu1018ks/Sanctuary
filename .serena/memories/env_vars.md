# Environment Variables

Root (Next.js): `.env.local`
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`: Google OAuth for NextAuth v5.
- `SANCTUARY_API_URL` (optional): base URL to Hono API. Some routes use `http://localhost:3001` directly.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional): only used by env test pages and some tests/mocks.

Hono API (`sanctuary-api/.env`):
- `DATABASE_URL`: Postgres DSN. With provided compose: `postgresql://sanctuary_user:sanctuary_password@localhost:5434/sanctuary?schema=public`.
- `GEMINI_API_KEY`: Required when using Gemini moderation service (default in `posts` route).
- `AI_REVIEW_API_URL` (optional): Python FastAPI moderation endpoint (defaults to `http://localhost:8000`).

Python AI Review (`sanctuary-ai-review`):
- Typically none required; configure CORS in `app/main.py` if hosting elsewhere.
