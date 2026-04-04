# Story Movie Maker -- Project Brief

*A guide for the next developer on this project*

---

## What Is This?

Story Movie Maker is a web application that lets people (especially kids!) turn their stories and artwork into short animated movies using AI.

Here's how it works, step by step:

1. **Write or paste a story** -- Could be a fairy tale you wrote, a school assignment, or anything from your imagination
2. **Upload your drawings or photos** -- Characters you drew, photos of your pets, crayon artwork, whatever you want in your movie
3. **AI creates a screenplay** -- The app reads your story and breaks it down into a proper movie script with scenes, dialogue, and descriptions
4. **You get a shoot plan** -- Like a real movie director, you see a plan for every shot in your movie -- what happens, which characters appear, what the camera does
5. **Review and adjust** -- Don't like a scene? Change it! Want your dragon to breathe ice instead of fire? Update the plan before anything gets filmed
6. **AI generates the movie** -- Shot by shot, the AI creates video clips from your plan, using your uploaded drawings and photos as reference
7. **Watch your movie** -- All the clips get stitched together into a real short film you can watch and share

**The big idea:** No other app lets kids be the director of their own AI movie using their own stories and their own artwork. Other tools either make content *for* kids (adults run them) or only animate a single drawing into a short clip. We do the whole thing -- story to movie.

---

## The Tech Stack (What We're Building With)

| Technology | What it does | Why we picked it |
|-----------|-------------|-----------------|
| **NextJS** | The web framework (builds the website) | Fast, modern, works great for apps like this. Handles both the pages you see and the behind-the-scenes logic |
| **PostgreSQL** | The database (stores users, stories, movies) | Reliable, free to start with (using Neon), industry standard |
| **AWS Cognito** | Login/signup system | Handles passwords, email verification, security -- so we don't have to build that from scratch |
| **AI Video Generator** | Creates the video clips | Runway Gen-4 Turbo is our primary pick. We also have backups (Kling, Veo) through a service called fal.ai |
| **Claude (LLM)** | Writes the screenplay and shoot plan | Takes the kid's story and turns it into structured scenes and shots |
| **AWS S3** | File storage | Stores uploaded drawings, photos, and generated videos |
| **Trigger.dev** | Background job runner | Manages the slow video generation process (each shot takes 30-120 seconds) |

---

## What's Already Done

- Feasibility research is complete (this document summarizes it)
- The project directory and git repo are set up
- No code has been written yet -- this is a fresh start

---

## Known Problems & Challenges

### Problem 1: Video Generation Is Expensive

**The issue:** Every movie costs real money to generate. Each 5-second video clip costs about $0.25-0.60, and a movie needs 12+ clips. That's **$5-12 per movie** just in AI costs.

**Why it matters:** If 100 people make movies in a month, that's $500-1,200 just to pay the AI video services -- before any other costs.

**Options:**
- **Option A:** Charge users per movie ($10-20 each) -- covers costs but might turn people away
- **Option B:** Subscription model ($15-30/month for X movies) -- more predictable revenue
- **Option C:** Start with a free tier (1 movie) + paid plans -- lets people try it first
- **Option D:** Use the cheapest provider (Veo 3.1 Lite at $0.05/sec) to keep costs around $3-4/movie

### Problem 2: COPPA (Children's Privacy Law)

**The issue:** There's a US law called COPPA that has strict rules about collecting data from kids under 13. Photos, drawings, and stories all count as personal data. The updated law (COPPA 2.0) kicked in April 2026.

**Why it matters:** If we let kids create accounts and upload content, we need parental consent systems, data protection, and possibly legal review ($2,000-5,000).

**Options:**
- **Option A (recommended for MVP):** Parents create accounts and manage everything. Kids use the app with a parent logged in. No COPPA burden.
- **Option B:** Build full COPPA compliance from day one -- adds 2-4 weeks of work and legal costs
- **Option C:** Target ages 13+ only -- avoids COPPA but loses the younger kid audience

### Problem 3: Video Quality Isn't Perfect

**The issue:** AI-generated video in 2026 is impressive but not flawless. About 20-40% of generated clips have weird glitches -- a character's hand might look wrong, physics might break, or things might look "off."

**Why it matters:** Movies won't look like Pixar. They'll look more like "really cool AI art in motion."

**Options:**
- **Option A:** Lean into the art style. Use kids' drawings as the visual base -- the hand-drawn style actually hides AI artifacts really well
- **Option B:** Let users regenerate individual shots they don't like (costs more but improves quality)
- **Option C:** Offer quality tiers -- "quick draft" (cheap, faster) vs "polished" (more expensive, regenerates bad shots automatically)
- **Reality check:** For a kid seeing their own drawing come alive as a moving video, the "wow factor" is huge regardless of imperfections. Magic beats perfection.

### Problem 4: It's Slow

**The issue:** Generating each video clip takes 30-120 seconds. A 12-shot movie could take 10-40 minutes to fully render.

**Why it matters:** Kids aren't patient. Waiting 20+ minutes for a movie is a lot.

**Options:**
- **Option A:** Show a fun progress screen ("Your movie is being filmed! Shot 3 of 12...") with previews of each shot as it completes
- **Option B:** Email/notify when the movie is ready -- "Go do something else, we'll tell you when it's done!"
- **Option C:** Generate a quick preview (lower quality, faster) first, then offer a "make it better" button
- **Option D:** Use Kling 3.0's multi-shot storyboard feature which generates up to 6 shots in one call (faster + better consistency)

### Problem 5: Characters Might Look Different Between Scenes

**The issue:** When AI generates each shot separately, the same character might look slightly different in each scene -- different hair, different clothes, different face.

**Why it matters:** It breaks the movie illusion if your main character keeps changing appearance.

**Options:**
- **Option A:** Use reference images -- upload a clear drawing of each character and send it with every shot generation
- **Option B:** Use Kling 3.0's "Bind Subject" feature that locks a character's appearance from a reference photo
- **Option C:** Use Luma's "Character Seeds" system for identity persistence
- **Option D:** Generate a character sheet first (front view, side view, expressions) and use it as reference for all shots

### Problem 6: API Services Can Shut Down

**The issue:** OpenAI's Sora (a video generation tool) just announced it's shutting down in September 2026. Any AI service we depend on could do the same.

**Why it matters:** If our one video provider shuts down, the whole app stops working.

**Options:**
- **Option A (recommended):** Use fal.ai as a middle layer -- it connects to multiple video AI providers through one API. If one dies, switch to another.
- **Option B:** Build our own abstraction layer that can swap providers with a config change
- **Option C:** Support 2-3 providers from the start and let users pick

---

## What the MVP (First Version) Should Include

The MVP is the minimum version we'd launch with -- just enough to work and be useful:

- [ ] Parent account signup/login (AWS Cognito)
- [ ] Write or paste a story
- [ ] Upload drawings and photos
- [ ] AI generates a screenplay from the story
- [ ] AI breaks the screenplay into a shot-by-shot plan
- [ ] View the shoot plan (read-only for MVP)
- [ ] Generate the movie with progress tracking
- [ ] Watch and download the finished movie
- [ ] Basic, kid-friendly UI (big buttons, simple layout, colorful)

**Estimated time:** 8-12 weeks for one developer using AI-assisted coding

### What Comes After MVP

- [ ] Edit and adjust the shoot plan before generating
- [ ] Child accounts with proper COPPA compliance
- [ ] Transitions, background music, narration
- [ ] Quality tiers (draft vs polished)
- [ ] Share movies with friends/family
- [ ] Gallery of your past movies

---

## Monthly Costs (Estimated at 100 Movies/Month)

| What | Cost | Notes |
|------|------|-------|
| Web hosting (Vercel) | $20/mo | Runs the website |
| Database (Neon) | $0 | Free tier is enough to start |
| File storage (S3) | ~$10/mo | Stores uploads and videos |
| Background jobs (Trigger.dev) | $0-20/mo | Runs the video generation queue |
| Video AI generation | $500-1,200/mo | The big cost -- depends on provider and quality |
| Story AI (Claude) | $30-50/mo | Writes the screenplays |
| **Total** | **$560-1,300/mo** | Scales with number of movies made |

---

## The Competition (Who Else Is Out There)

Nobody does exactly what we're building. Here's what exists:

| App | What it does | What it's missing |
|-----|-------------|-------------------|
| **Mootion** | Adults paste stories to make kids' animated videos | Kids can't use it. No drawing uploads. No shoot plan. |
| **Higgsfield AI** | Animates one drawing into a short clip | Only one drawing, only a few seconds, no full story |
| **Story.com** | Script-to-film for adults | Not kid-friendly at all |
| **LTX Studio** | Professional AI filmmaking tool | Way too complex for kids, expensive |
| **ReadKidz** | AI storybooks with narrated slideshows | Not real movies, adults operate it |

**Our edge:** We're the only one combining kid-as-creator + their own story + their own drawings + an editable shoot plan + a real short film.

---

## Quick Glossary

| Term | What it means |
|------|--------------|
| **MVP** | Minimum Viable Product -- the simplest version that actually works |
| **NextJS** | A framework for building websites with React (JavaScript) |
| **PostgreSQL** | A type of database for storing structured data |
| **AWS Cognito** | Amazon's login/authentication service |
| **LLM** | Large Language Model -- AI that understands and writes text (like Claude or ChatGPT) |
| **API** | Application Programming Interface -- how our app talks to other services |
| **COPPA** | Children's Online Privacy Protection Act -- US law protecting kids' data online |
| **S3** | Amazon's cloud file storage service |
| **Shoot plan** | A list of every shot in a movie -- what happens, who's in it, camera angle, etc. |
| **fal.ai** | A service that gives you one connection to many different AI video tools |
| **FFmpeg** | Free software for editing and combining video files |

---

## How to Get Started

1. Read through this document to understand the project
2. Look at the feasibility research in `.claude/plans/drifting-baking-biscuit.md` for deeper technical details
3. Set up the NextJS project (`npx create-next-app@latest`)
4. Start with authentication (AWS Cognito) -- it's the foundation everything else needs
5. Build the story input and file upload features next
6. Then tackle the screenplay/shoot plan generation
7. Video generation pipeline comes last (it's the most complex piece)

Good luck -- this is going to be a really fun project to build!
