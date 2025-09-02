# Sanctuary – Project Overview

- Purpose: Sanctuary is a social, positivity‑focused web app. Users post short messages, react to posts, and manage profiles. An admin dashboard moderates content. A moderation pipeline uses AI (Google Gemini or a Python FastAPI service) to judge posts before publication.
- Architecture:
  - Frontend: Next.js 15 (App Router) + React 19 + TypeScript, Tailwind CSS v4, shadcn/radix UI components. NextAuth v5 (Google provider) with PrismaAdapter persists sessions to Postgres.
  - Backend API: Hono (Node) service on port 3001, using Prisma to access Postgres and to expose routes for posts, reactions, profiles, and admin workflows.
  - AI Moderation: Two implementations:
    - Google Gemini via `GeminiAIReviewService` (requires `GEMINI_API_KEY`).
    - Optional Python FastAPI service (`sanctuary-ai-review`) exposing `/api/v1/moderate` used by `AIReviewService` if `AI_REVIEW_API_URL` is configured.
  - Database: PostgreSQL (docker compose provided). Prisma schema includes `User`, `UserProfile`, `Post`, `Reaction` with relations and indexes.
- Auth flow:
  - NextAuth v5 with Google. On first sign‑in, `auth.ts` ensures a `UserProfile` row exists for the user and augments session with `user.id` and `user.role`.
  - Admin Hono routes call back to `http://localhost:3000/api/auth/session` to verify the user has role `admin`.
- Data flow:
  - Next.js API routes proxy to Hono (e.g., `src/app/api/posts/route.ts` calls `http://localhost:3001/api/posts`). Hono creates posts, runs AI moderation, then stores status (approved/rejected) in Postgres.
  - Reactions API in Next.js proxies to Hono `/posts/:postId/reactions`.
- Notable directories:
  - `src/app` (routes, API handlers, layouts, providers), `src/components` (UI, post, layout, profile), `src/hooks` (feature hooks), `src/lib` (utils, design tokens), `sanctuary-api` (Hono + Prisma), `sanctuary-ai-review` (FastAPI moderation service), `__tests__` (Jest/RTL), `e2e` (Playwright).
- Notes:
  - There are references to a Supabase client used for env checks and tests (`src/app/env-test` and mocks). Core auth is NextAuth; the Supabase client file is expected at `src/lib/supabase/client` but is not present in the repo. Tests mock it.
