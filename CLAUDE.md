# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev -- -p 9090          # Dev server on http://localhost:9090
node worker-server.mjs          # Worker server on port 9091 (run alongside dev server)
npm run build                   # Production build
npm run lint                    # ESLint (flat config, eslint.config.mjs)
npx prisma migrate dev          # Run/create migrations
npx prisma generate             # Regenerate Prisma client after schema changes
```

The app requires **two processes** during development: the Next.js dev server (port 9090) and the worker server (port 9091). The worker server spawns detached Node processes for long-running AI generation tasks.

## Architecture

### Two-process model

Heavy AI work (screenplay generation, image/video generation) runs outside the Next.js server to avoid blocking requests:

1. **Next.js API routes** (`src/app/api/`) handle CRUD and status polling. They do NOT run AI generation inline.
2. **Worker server** (`worker-server.mjs`, port 9091) accepts POST requests and spawns detached child processes that run the `.mjs` worker scripts in `src/lib/ai/`.

Flow: Client -> Next.js API (creates DB records, returns immediately) -> Client POSTs to worker server -> Worker spawns `generate-worker.mjs` or `film-worker.mjs` -> Worker updates DB directly -> Client polls `/api/movies/[movieId]/progress` for status.

### Worker scripts vs library modules

There are **two copies** of the AI logic:

- `src/lib/ai/screenplay.ts`, `preview-images.ts`, `video-generation.ts` -- TypeScript library modules using `@/lib/prisma` (for use within Next.js server context)
- `src/lib/ai/generate-worker.mjs`, `film-worker.mjs` -- Standalone Node.js scripts with their own PrismaClient instances (spawned by worker-server.mjs as detached processes)

The `.mjs` workers are the ones actually used in production. The `.ts` modules are the original implementations that may be used for in-process calls in the future.

### AI pipeline

The movie creation pipeline has two main phases:

1. **Generate** (`generate-worker.mjs`): Takes story answers + art style -> calls Claude API (claude-sonnet-4-6) -> produces a structured screenplay JSON with 12 shots -> creates Shot records in DB. Progress logged to `movie.progressLog` (JSON array).

2. **Film** (`film-worker.mjs`): For each shot, generates a preview image via Kling Image O3 (`fal-ai/kling-image/o3/text-to-image`), then generates video via Kling Video 3.0 (`fal-ai/kling-video/v2/master/image-to-video`). Uses image-to-video with the preview as first frame.

Both workers use `movie.progressLog` (a JSON array on the Movie model) for real-time progress tracking, polled by the client via `/api/movies/[movieId]/progress`.

### Database

PostgreSQL with Prisma ORM. Key models: `User -> Movie -> Shot -> ShotCharacter -> Character`. Movie has a `progressLog` JSON field for real-time generation progress. Prisma config uses `engine: "classic"` (see `prisma.config.ts`). Generated client lives at `src/generated/prisma/`.

### Frontend

- Next.js 16 App Router with Tailwind CSS v4 (uses `@theme inline` in globals.css)
- Fonts: Comfortaa (headings via `--font-heading`) and Caveat (body/handwritten via `--font-handwritten`, `--font-sans`)
- Path alias: `@/*` maps to `./src/*`
- Pages: Home (story selector) -> `/create/[storyType]` (questionnaire) -> `/storyboard/[movieId]` (corkboard UI) -> `/movie/[movieId]` (player)

### Story templates

Defined in `src/lib/story-templates.ts`. Six templates (monster_battle, space_adventure, fairy_tale_quest, superhero_origin, robot_best_friend, haunted_house_mystery), but only monster_battle and space_adventure are in the Prisma enum. Each template has a 5-beat story structure and typed questions that drive the creation flow.

### External services

| Service | SDK | Purpose |
|---------|-----|---------|
| Claude API | `@anthropic-ai/sdk` | Screenplay generation (claude-sonnet-4-6) |
| fal.ai | `@fal-ai/client` | Kling Image O3 (previews) + Kling Video 3.0 (clips) |
| AWS S3 | `@aws-sdk/client-s3` | Asset storage (configured but not yet wired) |
| AWS Cognito | `aws-amplify` | Auth (not yet implemented, uses hardcoded dev user) |

## Key conventions

- Route handlers use `params: Promise<{ movieId: string }>` (Next.js 16 async params pattern)
- `serverExternalPackages` in next.config.ts for `@anthropic-ai/sdk` and `@aws-sdk/client-s3`
- Prisma singleton pattern in `src/lib/prisma.ts` (global caching for dev hot reload)
