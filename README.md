# Story Movie Maker

Turn your stories and drawings into real AI-generated movies.

Story Movie Maker is a web app that lets kids (with a parent's account) pick a story type, fill in characters and plot details, review a visual storyboard, and generate a 60-90 second animated movie using AI video generation.

## How It Works

1. **Pick a story type** (Monster Battle, Space Adventure)
2. **Choose an art style** (Storybook, Cartoon, Comic Book)
3. **Answer story questions** (who's the hero, what happens, etc.)
4. **Upload drawings or photos** of your characters
5. **Review the storyboard** -- AI generates a shot-by-shot plan with preview images
6. **Edit any shot** -- change what happens in plain language
7. **Film your movie** -- AI generates video for each shot
8. **Watch and download** your finished movie

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 16 (App Router) | Web framework |
| PostgreSQL (Railway) | Database |
| Prisma | ORM |
| AWS Cognito | Authentication (parent accounts) |
| Claude API | Story -> screenplay -> shot plan generation |
| Kling Image O3 (via fal.ai) | Storyboard preview images |
| Kling Video 3.0 (via fal.ai) | Video clip generation |
| ElevenLabs | Narration TTS |
| Suno | Custom end-credits song |
| FFmpeg | Video assembly |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- API keys for: Anthropic (Claude), fal.ai (Kling), ElevenLabs, Suno

### Setup

```bash
# Install dependencies
npm install

# Copy env template and fill in your keys
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start dev server
npm run dev -- -p 9090
```

Open http://localhost:9090 to see the app.

### Environment Variables

See `.env.example` for all required variables. At minimum you need:

- `DATABASE_URL` -- PostgreSQL connection string
- `ANTHROPIC_API_KEY` -- for screenplay generation
- `FAL_KEY` -- for image/video generation

## Project Structure

```
src/
  app/
    page.tsx                    # Home -- story type selector
    create/[storyType]/         # Story questionnaire + art style + narration
    storyboard/[movieId]/       # Corkboard storyboard UI
    movie/[movieId]/            # Movie player
    api/
      movies/                   # Create movie, film, status
      shots/                    # Edit shots, reshoot
  lib/
    prisma.ts                   # Database client
    story-templates.ts          # Story archetypes + questions
    ai/
      screenplay.ts             # Claude screenplay generation
      preview-images.ts         # Kling Image O3 previews
      video-generation.ts       # Kling Video 3.0 clips
docs/
  story-movie-maker-dealing-with-short-video.md   # Full product spec
  feasibility-research.md                          # Market + technical research
```

## Documentation

- **[PROJECT-BRIEF.md](PROJECT-BRIEF.md)** -- High-level project overview and handoff document
- **[docs/story-movie-maker-dealing-with-short-video.md](docs/story-movie-maker-dealing-with-short-video.md)** -- Full product and technical specification
- **[docs/feasibility-research.md](docs/feasibility-research.md)** -- Competitive landscape and feasibility research

## Status

**MVP in progress.** Current state:

- [x] Project scaffolding (Next.js, Prisma, Tailwind)
- [x] Database schema and migrations
- [x] Story type selector (2 templates)
- [x] Art style selection
- [x] Story questionnaire flow
- [x] Character creation with image upload
- [x] Claude screenplay + shot plan generation
- [x] Corkboard storyboard UI
- [x] Shot detail view with edit + save
- [x] Kling Image O3 preview generation
- [x] Kling Video 3.0 video generation
- [x] Reshoot flow
- [x] Movie player page
- [ ] AWS Cognito authentication
- [ ] Audio pipeline (ElevenLabs narration, Suno credits song, background music)
- [ ] FFmpeg video assembly
- [ ] FLUX Kontext Pro drawing enhancement
