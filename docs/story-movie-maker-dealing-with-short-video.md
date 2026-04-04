# Story Movie Maker — Product & Technical Specification

*Everything decided so far, ready for Claude Code to start building.*

---

## 1. What we're building

Story Movie Maker is a web app that lets kids (with a parent's account) turn their ideas into short AI-generated animated movies. The child picks a story type, fills in character and plot details, reviews a visual shoot plan (storyboard), and the system generates a 60–90 second movie composed of 5–15 second AI video clips stitched together.

**The core value proposition:** No other app lets kids be the director of their own AI movie using their own story ideas and their own artwork. Other tools either make content *for* kids or only animate a single drawing into a short clip. We do the whole thing — story idea to finished movie.

---

## 2. Video quality constraints (researched & confirmed)

These constraints are hard limits based on the current state of AI video generation (April 2026) and directly shape every product decision.

### Per-clip generation limits
- Most AI video generators produce clips of **5–20 seconds**.
- Kling 3.0 generates up to **15 seconds** per clip with multi-shot storyboard support (up to 6 camera cuts in a single generation).
- Runway Gen-4 Turbo caps at **10 seconds** per clip.
- Sora 2 maxes out at **25–35 seconds**.

### Quality degradation timeline
- **0–30 seconds:** Quality remains consistent. Character appearance stable. Motion natural.
- **30–60 seconds:** Subtle drift begins. Lighting may shift. Background details change.
- **60–120 seconds:** Noticeable degradation. Characters may morph. Physics become less reliable.
- **120+ seconds:** Quality varies wildly. Extensions frequently break the scene.
- Even the best models show **noticeable degradation after 20–25 seconds** of continuous generation.

### Character consistency across clips
- This is the #1 quality risk for multi-shot movies.
- Kling 3.0's "Identity-Lock" and Elements system maintains character appearance across its 6-cut multi-shot storyboard feature.
- Runway Gen-4's "Act-Two" feature provides character consistency via reference images.
- Every shot prompt must include character reference images and a style anchor.

### Target movie length: 60–90 seconds
- This is the sweet spot where quality stays high and the experience feels magical.
- A 60–90 second movie = **10–14 shots** at 5–8 seconds each.
- Longer stories get condensed by the AI into a tight screenplay — this is a feature, not a limitation. The AI acts as director, picking the best scenes.

### Shot count by target duration

| Duration | Shots | Shot length | Scenes | Cost range | Gen time |
|----------|-------|------------|--------|-----------|----------|
| 60 sec | 8–10 | 6–8 sec | 3–4 | $3–5 | 8–15 min |
| **90 sec** | **10–14** | **5–8 sec** | **4–6** | **$5–10** | **12–22 min** |
| 2 min | 14–18 | 6–8 sec | 5–7 | $8–15 | 18–30 min |
| 3 min | 20–30 | 5–8 sec | 8–12 | $12–20 | 25–45 min |

### Character consistency thresholds
- **1–5 shots:** Manageable with reference images. Most viewers won't notice issues.
- **6–12 shots:** Noticeable drift begins. Use Kling 3.0's multi-shot storyboard (6 shots with locked consistency per call).
- **13–20 shots:** Significant drift. Requires aggressive reference image use and possible regeneration.
- **20+ shots:** Very difficult. Consider splitting into episodes.
- **Key insight:** Kids' drawings as the visual style actually help — a hand-drawn, stylized aesthetic is far more forgiving of minor inconsistencies than photorealistic generation.

### Story length handling
- Under 500 words → 1 movie, 60–90 seconds
- 500–2,000 words → 1 movie, 90–120 seconds
- 2,000–5,000 words → Offer: 1 condensed movie (2 min) OR 2–3 episodes (60–90 sec each)
- 5,000+ words → Suggest episodes: 3–5 episodes of 60–90 sec each
- Soft input limit: ~5,000 words. Frame condensation positively: *"Our AI director picked the most exciting scenes for your movie!"*

### Production model
- We are **not** generating continuous long video. We are generating 10–14 individual clips and stitching them with FFmpeg.
- Kling 3.0's multi-shot storyboard generates ~15 seconds with up to 6 camera cuts per generation, meaning a 90-second movie needs ~2–3 storyboard generations.
- Budget 30% extra for retries: plan to generate ~16 clips to get 12 good ones (70–80% first-attempt success rate).

---

## 3. Story input: template-based story selection (MVP)

### Decision
Instead of free-form story input (where kids paste or write anything), the MVP uses **pre-defined story archetypes** that kids select from a menu. The child then fills in character details, setting, conflict specifics, and resolution within that template's structure.

### Why this approach wins
- **Lower cognitive load for kids.** Picking "Monster Battle" from a menu is exciting and immediate. Staring at a blank text box is intimidating.
- **Controlled input = predictable video quality.** Each template has a fixed 5-act micro-structure that maps cleanly to a known number of shots. The screenplay-to-shot-plan pipeline can be tuned for known structures.
- **Easier downstream questions.** Once a kid picks "Rescue Mission," every subsequent question has context — "Who got captured?" is easier than "What's the problem?"
- **Simpler to build.** No need for Claude to handle wildly variable free-form input, validate story coherence, or gracefully redirect when something won't translate to good video.

### Story type menu (MVP: start with 2, add more post-launch)
Present these as "What kind of movie do you want to make?" — not as "templates" or "tropes." Each should have an icon and a one-line hook.

**MVP launch (2 templates):**

| Story type | Hook | Underlying structure |
|---|---|---|
| **Monster Battle** | A scary creature shows up. Only you can stop it! | Peace → Threat appears → Decision to fight → Battle → Victory |
| **Space Adventure** | You're the captain. Where does your crew go? | Launch → Discovery → Danger → Solution → Return/new frontier |

**Post-launch additions (based on what kids respond to):**

| Story type | Hook | Underlying structure |
|---|---|---|
| Rescue Mission | Someone you love is in trouble. Go save them! | Setup → Capture/danger → Journey → Confrontation → Rescue |
| The Big Race | You have to win, but someone's trying to cheat. | Starting line → Early lead → Obstacle/cheat → Comeback → Finish |
| Magic Discovery | You find something magical. What do you do with it? | Normal life → Discovery → First use → Consequences → Mastery |
| Mystery | Something's missing. Can you figure out who took it? | Discovery of loss → Clues → Red herring → Revelation → Resolution |

### What the kid fills in per template
After selecting a story type, the child answers template-specific questions. Example for "Monster Battle":

1. **Who is the hero?** (name + upload a drawing or photo)
2. **Where does the story happen?** (pick or describe a setting)
3. **What monster appears?** (name + optional drawing upload)
4. **How does the hero try to fight it?** (pick from options or describe)
5. **How does the hero win?** (pick from options or describe)

These answers feed into Claude, which generates a full screenplay against the hidden 5-act template structure.

### Art style selection
After the story questionnaire, the kid picks a visual style for their movie. This gets baked into every image and video generation prompt as the style anchor.

| Style option | Description | Best for |
|---|---|---|
| **Storybook illustration** | Warm, painterly, classic children's book feel | Younger kids, fairy tales, gentle stories |
| **Colorful cartoon** | Bright, bold, animated TV show look | Action stories, funny stories, most versatile |
| **Comic book** | Dynamic panels, strong outlines, dramatic angles | Monster battles, space adventures, superhero stories |

The style anchor text is included in every technical prompt to maintain visual consistency across all shots.

### Future: guided interview mode (v2)
A wizard-style flow where Claude interviews the kid step-by-step without a pre-selected template. This allows more creative freedom for kids who've outgrown the templates. Deferred to post-MVP.

---

## 4. Shoot plan / storyboard (core product screen)

### Overview
The shoot plan is the screen where the kid feels like a movie director. It's a visual storyboard showing every shot in the movie as a card. Each card represents one 5–15 second video clip.

### Chosen layout: corkboard (Concept B)
A grid of pinned cards on a board background, with slight random rotation on each card for a handmade, tactile feel. Colored push pins per card. Handwritten-style font (Caveat) for scene titles.

### Card contents (board view)
Each card on the corkboard shows:
- **Shot number** badge (top-left of thumbnail)
- **Duration** badge (top-right of thumbnail)
- **Thumbnail area** — shows AI-generated static preview image (cheap/fast) before video is generated; shows video frame after generation
- **Scene title** — kid-friendly name ("The magic roar")
- **Scene description** — plain-language summary of what happens ("Luna turns and roars. Golden light blasts the Shadow Wolf away.")
- **Character tags** — colored pills showing which characters appear

### Shot pacing structure (for a 12-shot, 90-second film)

| Beat | Shots | Duration | Purpose |
|------|-------|----------|---------|
| Setup: "Once upon a time..." | 1–2 | ~12 sec | Establish character and world |
| Inciting incident: "Until one day..." | 3 | ~6 sec | Something changes |
| Rising action: "Because of that..." | 4–7 | ~24 sec | Adventure/challenge unfolds |
| Climax: "Until finally..." | 8–9 | ~12 sec | The big moment |
| Resolution: "And ever since then..." | 10–12 | ~18 sec | Wrap up, emotional payoff |

**Shot type balance:** 2–3 establishing/wide shots, 4–6 medium shots, 2–3 close-ups, 1–2 transition shots (sky, landscape, object detail).

**Pacing rules:** First 5 seconds are the most visually striking. Shorter shots in the middle, longer at start and end. Final shot should be longest (8–10 sec) — it's the emotional payoff.

### Detail view (tap a card)
Tapping a card opens a detail overlay with:
- **Large preview area** — static image preview or generated video
- **Left/right navigation arrows** + swipe gesture to move between shots without returning to the board
- **Dot indicators** at bottom of preview (like iOS photo dots) showing position in sequence
- **Shot label** ("Shot 3 of 12")
- **Editable scene description** — textarea where the kid can change what happens
- **Character list** for this scene
- **"Save changes" button** — saves edits back to the board
- **"Reshoot!" button** — regenerates this specific clip

### Two-layer description system
Each shot has TWO descriptions:
1. **Kid-facing description:** Plain language the child sees and edits ("Luna flies over the castle and it's on fire")
2. **Video generator prompt:** Technical prompt sent to the AI video API ("Medium tracking shot, anthropomorphic orange tabby cat character flying over medieval castle engulfed in flames, dramatic lighting, fantasy illustration style, smooth lateral camera movement")

The kid only sees and edits layer 1. When they save changes, Claude translates the updated kid-facing description into an updated technical prompt, preserving camera, style, and character reference instructions.

### Edit → Generate → Review loop

**Phase 1: Plan Mode (free, fast, unlimited)**
- Kid reviews and edits the storyboard text descriptions before any video is generated.
- All edits are free — just text changes, no API calls to video generators.
- Claude generates a **static image preview** for each card (image generation is ~$0.01–0.03 and takes seconds). The storyboard shows illustrated thumbnails of each scene.
- 90% of creative iteration should happen here.

**Phase 2: Film Mode (costs money, takes time)**
- Kid is happy with the plan → taps the big **"Film my movie!"** button.
- System generates video for all shots sequentially.
- As each shot completes, the video replaces the static thumbnail on the storyboard card.
- Fun progress UI: clapperboard animation, "Now filming Shot 3 of 12..." messaging.
- When all shots complete, the movie is assembled and ready to watch.

**Phase 3: Director's Review (targeted reshoots)**
- After watching the assembled movie, the kid can go back to any shot card and hit **"Reshoot!"** to regenerate just that clip.
- Reshoots are limited: **2–3 per shot** on the free/base tier. Frame as "film stock" not a restriction ("You have 2 reshoots left for this scene").
- Only the single clip is regenerated. FFmpeg swaps it into the final assembly.

### UI/UX principles for kids
- **Movie vocabulary everywhere.** "Reshoot" not "regenerate." "Film my movie" not "render." "Change what happens" not "edit prompt." "Now filming..." not "processing."
- **Big tap targets.** Buttons, cards, and navigation arrows must be large enough for small hands.
- **Fun transitions.** Card opens with a smooth animation. Clapperboard snaps when filming starts. Shots "develop" like Polaroids when they complete.
- **Colorful but not chaotic.** Colored push pins, character tag pills, and a warm board background — but the text and controls stay clean and readable.
- **Mobile-first swipe.** The detail view supports touch swipe left/right to navigate between shots.

---

## 5. Tech stack

| Technology | Purpose | Notes |
|---|---|---|
| **Next.js** | Web framework | Handles frontend pages + API routes |
| **PostgreSQL (Neon)** | Database | Users, stories, movies, shot plans, generation status |
| **AWS Cognito** | Auth | Parent accounts only for MVP. No child accounts (avoids COPPA). |
| **Kling 3.0** (primary) | Video generation | Multi-shot storyboard (6 cuts/generation), Identity-Lock for character consistency. Access via fal.ai. Generate at 1080p for MVP. |
| **Kling Image O3** | Storyboard preview images | Same MVL framework as Kling Video — previews become the literal first frame of the video. Series mode (2–9 consistent images per call). Via fal.ai. |
| **fal.ai** | API abstraction | Single API to Kling (video + image), plus fallback to Runway/Veo/Seedance if needed. |
| **FLUX Kontext Pro** | Drawing enhancement (optional) | Polishes a kid's rough crayon drawing into a cleaner reference image before it enters the pipeline. $0.04/image via fal.ai. |
| **Claude API** | Story → screenplay → shot plan | Takes kid's template answers, generates structured screenplay and technical video prompts. |
| **ElevenLabs** | Narration TTS | Optional narration to set up the story. ~$0.40/movie. |
| **Suno API** | Custom end-credits song | Generates a unique song with lyrics referencing the kid's characters and story. Plays over end credits. |
| **AWS S3** | File storage | Uploaded drawings/photos, generated images, generated video clips, final assembled movies. |
| **Trigger.dev** | Background jobs | Manages async video generation queue. Each shot = one job. Handles retries, status tracking, cost tracking. |
| **FFmpeg** | Video assembly | Stitches clips with crossfade transitions, overlays narration + background music, generates title cards. Runs server-side. |
| **Railway** | Hosting | Hosts the Next.js app. Already used for other projects. |

### Video generation strategy
- **Primary provider:** Kling 3.0 via fal.ai — best multi-shot storyboard, character consistency, and shared MVL with Kling Image O3 for preview-to-video accuracy.
- **Fallback providers:** Runway Gen-4 Turbo, Veo 3.1, Seedance 2.0 — all available through fal.ai.
- **Single provider for MVP.** Don't build multi-provider abstraction yet. Just use Kling 3.0. Switch if needed.
- **Image previews:** Kling Image O3 via fal.ai — generates storyboard thumbnails in series mode (2–9 consistent images per call). Each preview image feeds directly into Kling Video 3.0 as the first frame, so what the kid sees on the storyboard IS what they get in the video.
- **Resolution:** 1080p for MVP. 4K is 2–3x cost with minimal perceived benefit on phones/tablets.

### Audio strategy
- **Background music:** Royalty-free music library plays throughout the movie. Categorized by genre/mood to match story types.
- **Narration:** Optional. Used to set up the story, not narrate every scene. Kid chooses whether to include narration during story setup. Generated via ElevenLabs TTS.
- **End-credits song:** Custom AI-generated song from Suno with lyrics referencing the kid's characters and story. Plays over extended end credits. Generated per movie.

---

## 6. Data model (key entities)

```
User (parent account)
├── Movie
│   ├── story_type (enum: monster_battle, space_adventure, ...)
│   ├── story_answers (JSON: the kid's filled-in template responses)
│   ├── screenplay (JSON: Claude-generated structured screenplay)
│   ├── style_preset (enum: storybook_illustration, colorful_cartoon, comic_book)
│   ├── status (draft | planning | filming | assembling | complete)
│   ├── narration_enabled (boolean)
│   ├── total_duration_seconds
│   ├── final_video_url (S3 path to assembled movie)
│   ├── narration_script (text: Claude-generated narration)
│   ├── narration_audio_url (S3 path to ElevenLabs TTS output)
│   ├── background_music_url (S3 path or library reference)
│   ├── credits_song_url (S3 path to Suno-generated song)
│   ├── credits_song_lyrics (text: Suno prompt/lyrics)
│   └── generation_cost_total (sum of all costs)
│
│   ├── Character
│   │   ├── name
│   │   ├── raw_image_url (S3 path to kid's original drawing/photo)
│   │   ├── reference_image_url (S3 path — original or FLUX-enhanced version)
│   │   └── style_description (Claude-generated character description for prompts)
│   │
│   ├── Shot (ordered by sequence_number)
│   │   ├── sequence_number
│   │   ├── kid_description (what the child sees and edits)
│   │   ├── technical_prompt (what gets sent to video API)
│   │   ├── duration_seconds
│   │   ├── preview_image_url (S3 path to Kling Image O3 preview)
│   │   ├── video_url (S3 path to generated clip)
│   │   ├── status (draft | preview_generated | filming | complete | failed)
│   │   ├── reshoots_remaining (default: 2–3)
│   │   ├── generation_cost (tracked per shot)
│   │   └── characters (many-to-many with Character)
│   │
│   └── TitleCard (ordered by position)
│       ├── position (before_shot_1, between_shot_3_4, end_credits, etc.)
│       ├── text (e.g., "A film by Emma", "Meanwhile, in the enchanted forest...", "The End")
│       └── duration_seconds
```

---

## 7. Generation pipeline

### Step 1: Story → Screenplay (Claude)
**Input:** Story type + kid's template answers + character reference images + chosen art style
**Output:** Structured JSON screenplay with 5-act structure, broken into 10–14 scenes, plus a narration script (if narration enabled) and title card text.
**Claude's job:** Act as the director — condense the kid's ideas into a tight, filmable 60–90 second script. Each scene gets a title, kid-friendly description, list of characters present, and suggested duration. Also generates opening title text, any mid-movie title cards for scene transitions, and end credits text.

### Step 2: Screenplay → Shot Plan (Claude)
**Input:** Structured screenplay + character descriptions + art style preset
**Output:** For each scene, a detailed technical video prompt including:
- Camera angle and movement (wide shot, close-up, tracking, etc.)
- Character positioning and actions
- Environment/lighting details
- Art style anchor from kid's chosen style preset (e.g., "warm children's storybook illustration" or "vibrant colorful cartoon")
- Character reference image references
- Duration in seconds

### Step 3: Drawing Enhancement (optional — FLUX Kontext Pro)
**Input:** Kid's raw uploaded drawings/photos
**Output:** Polished reference images that maintain the kid's artistic intent but are cleaner for AI reference use.
**When to use:** When the kid's drawing is very rough (low detail, faint lines). Skip if the drawing is already clear. $0.04/image.

### Step 4: Shot Plan → Preview Images (Kling Image O3)
**Input:** Technical prompt per shot + character reference images
**Output:** Static preview image per shot, displayed on storyboard cards. Generated in series mode (2–9 images per API call for consistency).
**Key advantage:** Kling Image O3 shares the same MVL framework as Kling Video 3.0. Each preview image becomes the literal first frame of the video — what the kid sees IS what they get. ~$0.028/image at 1K resolution.

### Step 5: Shot Plan → Video Clips (Kling Video 3.0 via fal.ai)
**Input:** Kling Image O3 preview (as first frame) + technical prompt + character reference images + duration per shot
**Output:** One video clip per shot (5–8 seconds each)
**Execution:** Trigger.dev background jobs. Use Kling's multi-shot storyboard where possible (6 shots per call with native character consistency). Remaining shots generated individually.
**Error handling:** If a shot fails, retry up to 2 times automatically. If still failing, mark as failed and let the kid reshoot manually.
**Budget:** Generate ~30% more clips than needed to account for failures.

### Step 6: Audio Generation (parallel with Step 5)
These run in parallel with video generation to minimize total wait time:

**6a. Narration (if enabled) — ElevenLabs**
**Input:** Narration script from Step 1
**Output:** Narration audio file (MP3). Used to set up the story at the beginning and bridge major scene transitions.
**Cost:** ~$0.40/movie

**6b. End-Credits Song — Suno**
**Input:** Prompt with kid's character names, story theme, and mood (generated by Claude from the screenplay)
**Output:** Custom song (60–90 seconds) with lyrics referencing the kid's story. Plays over end credits.
**Example prompt:** *"Upbeat adventure song for kids about Luna the cat who defeated the Shadow Wolf. Heroic, fun, singable chorus. 75 seconds."*

**6c. Background Music — Library**
**Input:** Story type + mood
**Output:** Selected royalty-free track from pre-built library, matched to story genre (adventure, mystery, space, etc.)

### Step 7: Final Assembly (FFmpeg)
**Input:** All video clips + narration audio + background music + end-credits song + title card text
**Output:** Single assembled movie file (MP4, 1080p)

**Assembly order:**
1. Generate title card: "[Movie Title] — A film by [kid's name]" (FFmpeg drawtext, 3 seconds, fade from black)
2. Overlay narration on first 1–2 shots (if enabled) — sets up the story
3. Stitch shots with **0.5-second crossfade transitions** between scenes, **hard cuts** within scenes
4. Insert title cards at major scene transitions where needed ("Meanwhile, in the enchanted forest...")
5. Add "The End" card (2 seconds)
6. Add extended end credits sequence with character art, "Directed by [kid's name]", and custom Suno song playing underneath
7. Mix background music at ~15% volume under the entire movie (ducking under narration/dialogue)
8. Fade in from black (1 sec opening), fade out to black (1.5 sec before credits)

---

## 8. Cost model

### Per-movie cost estimate (12 shots, 90 seconds)

| Component | Cost |
|---|---|
| Claude (screenplay + shot plan + narration script) | $0.30–0.50 |
| Drawing enhancement (FLUX Kontext, ~4 drawings) | $0.16 |
| Preview images (12 shots, Kling Image O3 series mode) | ~$0.34 |
| Video generation (16 clips incl. retries, Kling 3.0 via fal.ai) | $6.70–8.00 |
| Narration TTS (ElevenLabs, ~90 sec) | ~$0.40 |
| End-credits song (Suno, custom) | ~$0.50–1.00 |
| Background music (royalty-free library) | $0 |
| FFmpeg assembly (compute) | ~$0.10 |
| **Total per movie** | **~$8.50–10.50** |

### Cost at scale (100 movies/month)

| Item | Cost |
|---|---|
| Railway hosting | ~$20 |
| Neon PostgreSQL | $0 (free tier) |
| S3 + CloudFront | ~$10 |
| Trigger.dev | $0–20 |
| Video + image generation (100 movies) | ~$700–900 |
| Claude API (100 movies) | ~$30–50 |
| ElevenLabs (100 movies) | ~$40 |
| Suno (100 movies) | ~$50–100 |
| **Total** | **~$850–1,100/month** |

### Cost guardrails
- **Budget envelope per movie:** Set a max generation cost ceiling ($15). Track spending per movie.
- **Reshoot limits:** 2–3 reshoots per shot. Prevents runaway costs from a kid hitting "Reshoot" endlessly. Frame as "film stock" not a restriction.
- **No retry loops without caps:** Automatic retries on failure capped at 2 per shot. After that, surface the failure to the user.
- **Preview iteration is free.** 90% of creative changes happen in Plan Mode (text edits + image previews). Image previews are <3% of total cost.

---

## 9. MVP scope

### In scope (build this)
- [ ] Parent account signup/login (AWS Cognito)
- [ ] Story type selection menu (2 archetypes: Monster Battle, Space Adventure)
- [ ] Art style selection (storybook illustration, colorful cartoon, comic book)
- [ ] Template-based story questionnaire per archetype
- [ ] Character creation (name + reference image upload)
- [ ] Optional drawing enhancement (FLUX Kontext Pro)
- [ ] Claude generates screenplay + narration script from template answers
- [ ] Claude generates shot plan with technical prompts
- [ ] Kling Image O3 preview images for storyboard (series mode)
- [ ] Corkboard storyboard UI with card grid
- [ ] Card detail view with swipe navigation between shots
- [ ] Editable scene descriptions (kid-facing layer)
- [ ] Claude translates edits into updated technical prompts
- [ ] "Film my movie!" triggers video generation for all shots
- [ ] Progress UI during generation ("Now filming Shot 3 of 12...")
- [ ] Reshoot individual shots (2–3 per shot limit)
- [ ] Optional narration to set up the story (ElevenLabs TTS)
- [ ] Background music from royalty-free library
- [ ] Custom end-credits song generated by Suno with story-specific lyrics
- [ ] Title card: "[Movie Title] — A film by [kid's name]"
- [ ] Extended end credits with character art + Suno song
- [ ] Crossfade transitions between scenes, hard cuts within scenes
- [ ] FFmpeg assembly of final movie (1080p)
- [ ] Watch and download finished movie
- [ ] Kid-friendly UI: big buttons, movie vocabulary, colorful design, Fredoka + Caveat fonts

### Out of scope (post-MVP)
- [ ] Additional story templates (Rescue Mission, Big Race, Magic Discovery, Mystery)
- [ ] Free-form story input (guided interview wizard)
- [ ] Editable/reorderable shot sequence (drag to reorder shots)
- [ ] Child accounts with COPPA compliance
- [ ] Quality tiers (draft vs. polished)
- [ ] Share movies with friends/family
- [ ] Gallery of past movies
- [ ] Multi-provider video generation (use fal.ai's provider switching)
- [ ] Content moderation pipeline
- [ ] Storage lifecycle / retention policies
- [ ] 4K video output
- [ ] Episode splitting for long stories

---

## 10. UI design direction

### Overall aesthetic
- **Playful and professional** — feels like a real movie-making tool, not a toy. Think "kid's version of Final Cut Pro" not "Crayola drawing app."
- **Movie-making metaphors everywhere.** Corkboard, push pins, clapperboards, film reels, director's chair. The language and visuals should make the kid feel like a Hollywood director.
- **Colorful but clean.** Use a warm palette with colored accents (push pins, character tags) against clean white cards and neutral board backgrounds.
- **Tactile feel.** Slightly rotated cards, handwritten fonts for titles, pin shadows — things that feel physical and handmade.

### Typography
- **Fredoka** — headings, buttons, UI labels. Rounded, friendly, reads well at all sizes.
- **Caveat** — scene titles on storyboard cards. Handwritten feel reinforces the creative/sketchbook vibe.
- **DM Sans** — body text, descriptions, secondary UI. Clean and readable.

### Key UI screens
1. **Home / story type selector** — grid of story type cards with icons and hooks
2. **Story questionnaire** — step-by-step form per template (who's the hero, what's the setting, etc.)
3. **Character setup** — name your characters + upload drawings/photos
4. **Corkboard storyboard** — the main shoot plan screen (see Section 4)
5. **Detail/edit view** — overlay when tapping a storyboard card (see Section 4)
6. **Filming progress** — fun progress screen while video generates
7. **Movie player** — watch the finished movie with reshoot/download options

---

## 11. Key technical decisions log

| Decision | What we chose | Why |
|---|---|---|
| Story input method | Template-based menu (not free-form) | Controls input variability → predictable video quality. Lower cognitive load for kids. |
| MVP templates | Start with 2 (Monster Battle + Space Adventure) | Ship faster, learn what kids like, add more post-launch. |
| Target movie length | 60–90 seconds, 10–14 shots | Sweet spot for AI video quality, cost, and narrative completeness. |
| Art style | Kid picks from 3 options (storybook, cartoon, comic book) | Gives creative control while keeping it structured for prompt consistency. |
| Video provider | Kling 3.0 via fal.ai | Best multi-shot storyboard (6 cuts/generation), character consistency (Identity-Lock). fal.ai provides fallback to other providers. |
| Image preview model | Kling Image O3 via fal.ai | Shares MVL framework with Kling Video 3.0 — previews become the literal first frame of the video. Series mode for batch consistency. |
| Drawing enhancement | FLUX Kontext Pro (optional) | Polishes rough kid drawings into cleaner references. $0.04/image. |
| Storyboard layout | Corkboard grid (Concept B) | Most tactile and fun. See-everything-at-once layout. Slight card rotations add handmade feel. |
| Shot navigation | Swipe left/right in detail view | Natural mobile gesture. Don't force return to board for every edit. Dot indicators show position. |
| Edit loop | Plan Mode (free edits + image previews) → Film Mode (generate video) → Director's Review (reshoots) | Separates cheap iteration from expensive generation. 90% of creative work happens before any video API calls. |
| Auth approach | Parent accounts only (MVP) | Avoids COPPA entirely. Kids use app with parent logged in. |
| Reshoot model | 2–3 reshoots per shot | Caps cost while giving the kid agency. Framed as "film stock" not restriction. |
| Description layers | Kid-facing text + hidden technical prompt | Kids edit in plain language. Claude handles prompt engineering behind the scenes. |
| Transitions | 0.5s crossfade between scenes, hard cuts within scenes | Crossfades mask visual inconsistencies between independently generated clips. |
| Title cards | Opening title + scene transition cards + "The End" + extended end credits | Makes even a 60-second film feel intentional and complete. Free to generate with FFmpeg. |
| Narration | Optional, used to set up the story | Kid chooses. Carries story continuity, bridges visual jumps. ElevenLabs TTS ~$0.40/movie. |
| Background music | Royalty-free library, plays throughout | Creates emotional cohesion, masks audio jumps between clips. Categorized by genre/mood. |
| End-credits song | Custom Suno-generated song per movie | Lyrics reference the kid's characters and story. Magical personal touch. Plays over extended credits. |
| Video resolution | 1080p for MVP | 4K is 2–3x cost with minimal perceived benefit on phones/tablets. |
| Hosting | Railway | Already used for other projects. Keeps infrastructure in one place. |

---

## 12. Resolved questions

All questions from the original spec have been answered:

| # | Question | Answer |
|---|----------|--------|
| 1 | Story templates | Start with 2 for MVP (Monster Battle + Space Adventure). Add more post-launch based on what kids like. |
| 2 | Art style anchor | Kid picks from 3 options: storybook illustration, colorful cartoon, comic book. Style choice baked into every prompt. |
| 3 | Image preview model | **Kling Image O3** via fal.ai. Same MVL as Kling Video = previews become first frames of video. Series mode for batch generation. |
| 4 | FFmpeg transitions | 0.5s crossfade dissolve between scenes, hard cuts within scenes. Fade to/from black at major story breaks. |
| 5 | Title card / credits | Yes. Opening: "[Movie Title] — A film by [name]". Scene transitions where needed. Extended end credits with character art and custom Suno song. |
| 6 | Audio | Background music (royalty-free library) + optional narration (ElevenLabs) + custom end-credits song (Suno). All in MVP. |
| 7 | Video resolution | 1080p for MVP. 4K deferred to post-MVP. |
| 8 | Hosting | Railway. |