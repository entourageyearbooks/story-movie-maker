# Story Movie Maker -- Feasibility Research

## Context
Building a family-friendly web app where users (including kids) upload stories + photos/drawings, AI generates a screenplay and shoot plan, user reviews/adjusts it, then AI generates a movie shot-by-shot. Stack: NextJS, PostgreSQL, AWS Cognito, AI video generation API.

---

## (A) Competitive Landscape -- Does Anyone Else Do This?

### Short answer: No one does exactly this. But many do pieces of it.

**Direct competitors (partial overlap):**

| Product | What it does | Gap vs our concept |
|---------|-------------|-------------------|
| **Mootion** | Paste story -> AI animated video (3 min max) | Adults make content FOR kids. No drawing uploads. No shoot plan step. |
| **ReadKidz** | AI story + illustration + video. Publishes to YouTube/KDP | Output is narrated slideshows, not movies. For adults, not kids. |
| **Higgsfield AI** | Animates a single child's drawing into a cartoon clip (Sora 2 engine, 1080p) | Single drawing -> short clip only. No multi-scene movie from a story. |
| **Revid AI** | Upload one drawing + description -> animated clip with voiceover | Short novelty clips only. Single drawing input. |
| **Story.com** | Script-to-film platform with storyboarding. 1M+ users | Not kid-focused or kid-safe. General-purpose tool. |
| **Storytime AI** | AI story generator + read-along video. 85K+ books/videos | Kids don't upload their own stories. Animated storybook, not movie. |

**Adjacent competitors (professional tools):**

| Product | What it does | Why it's not us |
|---------|-------------|----------------|
| **AnimateAI** | Full AI video pipeline (GPT-4 + MidJourney + Runway + ElevenLabs). Character consistency. | Not kid-friendly. Complex interface. $30-100/mo. |
| **LTX Studio** | Professional AI filmmaking. Script -> storyboard -> film. Uses Veo 2/3. | Professional tool, not for kids. $15-125/mo. |
| **Steve AI** | AI video generator with kids section. Template-based. | Template-driven, not creative. Adults operate it. |
| **Krikey AI** | AI 3D animation maker. Classroom-certified. | Ages 13+. 3D puppet-style only. No story/drawing upload. |

### Our differentiation (no one does ALL of these):
1. **Kid-as-creator** -- Kids drive the process, not adults making content for kids
2. **Own story + own drawings -> movie** -- No one combines text story AND uploaded art into multi-scene video
3. **Editable shoot plan** -- No kid-focused tool has this intermediate step
4. **Full short-film length** -- Most tools max at 5-second to 3-minute clips

### Market signals:
- AI in education: $20B+ market by 2027 (38% CAGR)
- TikTok AI cartoon trend (2025-2026) shows massive consumer appetite
- Parents seeking creative screen time over passive consumption
- YouTube kids content is a multi-billion-dollar market

---

## (B) Technical Feasibility & Effort

### AI Video Generation -- Current State (April 2026)

**Recommended providers:**

| Provider | Cost/sec | Max length | Image-to-video | Character consistency | API maturity | Safety |
|----------|----------|-----------|----------------|----------------------|-------------|--------|
| **Runway Gen-4 Turbo** | $0.05 | 10 sec | Primary mode | Reference images | Best | Best (NCMEC reporting) |
| **Kling 3.0** (via fal.ai) | $0.07-0.28 | 3-15 sec | Yes + "Bind Subject" | 6-shot storyboard (best) | Good | Less documented |
| **Google Veo 3.1 Lite** | $0.05-0.08 | 8 sec | "Ingredients to Video" (4 refs) | Good | Good | Google-grade |
| **Luma Dream Machine** | ~$0.12 | Up to 60 sec (chained) | Yes + "Character Seeds" | Good | Good | Moderate |

**Avoid:** Sora (shutting down Sept 2026), Stability Video (API discontinued), Seedance (legal issues)

**Smart architecture:** Use **fal.ai as aggregator** -- single API, multiple providers, fallback protection.

### Cost Per Movie (estimated)

A ~1 minute movie with 12 shots x 5 seconds each:
- **Budget tier** (Veo 3.1 Lite): ~$3.40/movie
- **Standard tier** (Runway Gen-4 Turbo): ~$3.00 base, ~$3.90 with retries
- **Premium tier** (Runway Gen-4.5): ~$18/movie
- **LLM costs** (screenplay generation): ~$0.30-0.50/movie
- **Total realistic cost:** ~$5-12/movie depending on retry rate and quality tier

### Quality Reality Check

**What works well:**
- Individual 5-8 second clips can look near-broadcast quality for simple scenes
- Stylized/animated content (from kids' drawings) works BETTER than photorealistic -- hides artifacts
- Character consistency is solvable via reference images and Kling's multi-shot storyboarding

**What's still hard:**
- 20-40% of generations need re-doing (artifacts, distortions, physics breaks)
- Text rendering in video is unreliable
- Complex multi-character interactions often fail
- Environment consistency across scenes is harder than character consistency
- Total generation time: 10-40 minutes for a full movie (30-120 sec per clip)

**Bottom line:** Output quality is "impressive demo" level -- good enough to delight kids and families, not good enough for professional broadcast. Think "AI-enhanced home movie" not "Pixar short." This is actually perfect for the use case.

### Technical Stack Assessment

| Component | Approach | Effort | Risk |
|-----------|----------|--------|------|
| **Auth** (AWS Cognito) | Amplify v6 + `@aws-amplify/adapter-nextjs`. Cookie-based tokens for App Router. | Low | Low. No built-in COPPA support -- must build age-gating yourself. |
| **File uploads** | S3 presigned URLs (client direct upload). ~$0.023/GB/month. | Low | Low |
| **Database** | Neon PostgreSQL (free tier) or AWS RDS | Low | Low |
| **Screenplay generation** | 3-stage LLM pipeline (analysis -> screenplay -> structured shoot plan as JSON). Claude Sonnet. | Medium | Low |
| **Video generation pipeline** | Trigger.dev or Inngest for job queue. Per-shot generation with retries. | Medium-High | Medium (API reliability, cost overruns) |
| **Video assembly** | FFmpeg in Trigger.dev compute or Lambda with FFmpeg layer | Medium | Low |
| **Frontend** | NextJS App Router. Kid-friendly UI with large buttons, drag-and-drop, visual feedback. | Medium | Low |
| **Deployment** | Vercel ($20/mo) + Neon (free) + S3/CloudFront + Trigger.dev | Low | Low |

### Effort Estimate (Solo dev + AI-assisted)

**MVP: 8-12 weeks**

MVP scope:
- Parent-only accounts (sidesteps COPPA entirely for launch)
- Text story input (paste or type)
- Image uploads (photos, drawings)
- AI screenplay + shoot plan generation (read-only initially)
- Sequential video generation with progress tracking
- Basic video assembly (simple cuts, no transitions)
- Movie playback and download

Post-MVP additions (4-8 more weeks):
- Shoot plan editing/adjustment UI
- Child accounts with COPPA compliance
- Transitions, music, narration
- Quality tier selection
- Social sharing

### Monthly Operating Costs (at 100 movies/month)

| Item | Cost |
|------|------|
| Vercel Pro | $20 |
| Neon PostgreSQL | $0 (free tier) |
| S3 + CloudFront | ~$10 |
| Trigger.dev | $0-20 |
| Video generation (100 movies) | ~$500-1,200 |
| LLM calls | ~$30-50 |
| **Total** | **~$560-1,300/month** |

### COPPA Considerations

- COPPA 2.0 compliance deadline: **April 22, 2026** (now)
- Photos, drawings, and voice recordings used for AI trigger strict consent requirements
- **Strong recommendation:** Launch MVP as adults-only (parents create on behalf of kids). This eliminates COPPA burden at launch.
- Full COPPA compliance adds 2-4 weeks dev + $2,000-5,000 legal counsel
- AWS Cognito has zero built-in COPPA support -- all consent flows must be custom

---

## (C) Quality of Movies

### Realistic expectations by tier:

**"Magic moment" quality (achievable now):**
- A child's drawing comes alive and moves for 5-10 seconds -- this alone is magical
- Simple scenes (character walking, flying, talking) look great
- Stylized/cartoon aesthetic masks AI artifacts effectively
- With good prompting, individual shots can be genuinely impressive

**"Short film" quality (achievable with effort):**
- 12-20 shots stitched together with basic transitions
- Character maintains recognizable identity across most shots (with reference images)
- Narrative is followable but may have visual inconsistencies between scenes
- Total runtime: 1-2 minutes realistic, 3-5 minutes ambitious
- Think: "enhanced animated storybook with motion" more than "Pixar short"

**What NOT to promise:**
- Lip-synced dialogue (unreliable)
- Complex action sequences (physics breaks)
- Perfect consistency across all shots
- Professional broadcast quality
- Movies longer than 3-5 minutes without significant quality degradation

### The "wow factor" assessment:
For a kid who drew pictures and wrote a story, seeing their creation come to life as a moving, narrated video will be **genuinely magical** regardless of technical imperfections. The emotional impact far exceeds the technical quality bar. This is the core insight -- perfection isn't needed, magic is.

---

## Summary Verdict

| Dimension | Assessment |
|-----------|-----------|
| **Competition** | No direct competitor does all of this. Strong differentiation opportunity. |
| **Technical feasibility** | Fully feasible. All components have production APIs. Main complexity is the video generation pipeline orchestration. |
| **Effort to launch** | 8-12 weeks for MVP (solo + AI). Manageable. |
| **Cost to operate** | $5-12 per movie. Needs a $10-20/movie price point or subscription model. |
| **Movie quality** | Good enough to delight kids/families. "Magic moment" not "Pixar quality." Stylized content from kids' drawings actually works in our favor. |
| **Key risk** | Video generation costs and API reliability. Mitigate with multi-provider strategy (fal.ai). |
| **COPPA** | Launch as parent-only accounts. Add kid accounts post-launch with legal counsel. |

**Overall: GREEN LIGHT for MVP.** The concept is differentiated, technically feasible, and the quality bar (delighting kids) is achievable with current AI video tools.
