# Repository Structure

- Root (Next.js app)
  - `package.json`: scripts for dev/build/test/lint/format.
  - `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc`, `postcss.config.mjs`.
  - `src/`
    - `app/`: App Router pages, layouts, API routes, providers.
      - `api/`: server routes proxying to Hono (`posts`, `profile`, `auth`, `check-env`).
      - `admin/`, `profile/`, `env-test/`, root `page.tsx`, `layout.tsx`, `globals.css`.
      - `providers/`: `SessionProvider` (NextAuth) and `AuthContext` (Supabase-based, currently unused in layout).
    - `components/`: `ui/` (shadcn/radix), `post/`, `layout/`, `profile/` components.
    - `hooks/`: domain hooks like `usePostsTimeline`, `useReactions`, `useAdmin*`.
    - `lib/`: `utils.ts`, `design-tokens.ts`.
    - `styles/`: `design-tokens.css`.
    - `types/`: `post.ts`, `reaction.ts`, `profile.ts`, `next-auth.d.ts`.
  - `__tests__/`: Jest + RTL tests (components and API), Supabase mocks.
  - `e2e/`: Playwright helpers and test clients.
  - `public/`: static assets.
  - `auth.ts`: NextAuth config using Prisma adapter and Google provider.

- `sanctuary-api/` (Hono + Prisma backend)
  - `src/`: `index.ts` (server), `routes/` (`posts`, `profile`, `admin`), `middleware/` (CORS, logger, error, adminAuth), `services/` (AI review).
  - `prisma/`: `schema.prisma`, migrations, generates client to `src/generated/prisma`.
  - `docker-compose.yml`: Postgres + pgAdmin (host port 5434).
  - `package.json`, `tsconfig.json`.

- `sanctuary-ai-review/` (Python FastAPI moderation)
  - `app/`: FastAPI app and services; `requirements.txt`. Exposes `/api/v1/moderate`.

- Reports & misc
  - `playwright-report/`, `test-results/`: test artifacts.
  - `.serena/`, `.swc/`, `document/`: tooling or docs.
