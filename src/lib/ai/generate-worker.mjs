// This script runs in a separate Node.js process to avoid blocking the main server.
// Usage: node generate-worker.mjs <movieId>

import Anthropic from "@anthropic-ai/sdk";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const anthropic = new Anthropic();

const movieId = process.argv[2];
if (!movieId) {
  console.error("Usage: node generate-worker.mjs <movieId>");
  process.exit(1);
}

const STYLE_PROMPTS = {
  storybook_illustration:
    "warm children's storybook illustration style, soft painterly textures, gentle lighting, watercolor-like backgrounds",
  colorful_cartoon:
    "bright colorful cartoon animation style, bold outlines, vibrant saturated colors, smooth cel-shaded look",
  comic_book:
    "dynamic comic book style, strong ink outlines, dramatic angles, halftone dot textures, bold action lines",
};

const STORY_STRUCTURES = {
  monster_battle: { title: "Monster Battle", structure: ["Peace", "Threat appears", "Decision to fight", "Battle", "Victory"] },
  space_adventure: { title: "Space Adventure", structure: ["Launch", "Discovery", "Danger", "Solution", "Return/new frontier"] },
  fairy_tale_quest: { title: "Fairy Tale Quest", structure: ["Wish", "Twist", "Journey", "Challenge", "Happy ending"] },
  superhero_origin: { title: "Superhero Origin", structure: ["Normal day", "Transformation", "First mission", "Villain", "Triumph"] },
  robot_best_friend: { title: "Robot Best Friend", structure: ["Meeting", "Bonding", "Misunderstanding", "Separation", "Reunion"] },
  haunted_house_mystery: { title: "Haunted House Mystery", structure: ["Dare", "Exploration", "Clues", "Scare", "Truth revealed"] },
};

async function logProgress(stage, message, detail) {
  const entry = {
    time: new Date().toLocaleTimeString(),
    stage,
    message,
    ...(detail ? { detail } : {}),
  };

  const movie = await prisma.movie.findUniqueOrThrow({
    where: { id: movieId },
    select: { progressLog: true },
  });

  const log = movie.progressLog || [];
  log.push(entry);

  await prisma.movie.update({
    where: { id: movieId },
    data: { progressLog: JSON.parse(JSON.stringify(log)) },
  });
}

async function run() {
  try {
    await logProgress("setup", "Loading your story details...");

    const movie = await prisma.movie.findUniqueOrThrow({
      where: { id: movieId },
      include: { characters: true },
    });

    const template = STORY_STRUCTURES[movie.storyType];
    if (!template) throw new Error(`Unknown story type: ${movie.storyType}`);

    const stylePrompt = STYLE_PROMPTS[movie.stylePreset];
    const answers = movie.storyAnswers;

    const characterDescriptions = movie.characters
      .map((c) => `- ${c.name}${c.referenceImageUrl ? " (has reference image)" : ""}`)
      .join("\n");

    const answerSummary = Object.entries(answers)
      .filter(([, v]) => v && !String(v).startsWith("http"))
      .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
      .join(", ");

    await logProgress(
      "prompt",
      "Building the prompt for our AI director...",
      `Story type: ${template.title} | Style: ${movie.stylePreset.replace(/_/g, " ")} | Characters: ${movie.characters.map((c) => c.name).join(", ") || "none yet"} | Answers: ${answerSummary}`
    );

    const prompt = `You are a children's movie director creating a short animated film. Generate a complete screenplay for a 90-second movie.

STORY TYPE: ${template.title}
STORY STRUCTURE: ${template.structure.join(" → ")}

KID'S ANSWERS:
${Object.entries(answers).map(([key, value]) => `${key}: ${value}`).join("\n")}

CHARACTERS:
${characterDescriptions}

ART STYLE: ${stylePrompt}

NARRATION ENABLED: ${movie.narrationEnabled}

REQUIREMENTS:
- Create exactly 12 shots, each 5-8 seconds long (total ~90 seconds)
- Follow the story structure: ${template.structure.join(" → ")}
- Shot pacing:
  - Shots 1-2 (~12 sec): Setup - establish character and world
  - Shot 3 (~6 sec): Inciting incident - something changes
  - Shots 4-7 (~24 sec): Rising action - adventure unfolds
  - Shots 8-9 (~12 sec): Climax - the big moment
  - Shots 10-12 (~18 sec): Resolution - wrap up, emotional payoff
- Each shot needs:
  1. A kid-friendly description (plain language, exciting, what the kid sees)
  2. A technical video generation prompt (camera angle, character actions, lighting, environment, the art style anchor)
  3. Which characters appear
  4. Camera direction (wide shot, medium shot, close-up, tracking, etc.)
  5. Duration in seconds
- First shot should be the most visually striking
- Last shot should be the longest (8-10 sec) for emotional payoff
- Include a movie title
- If narration is enabled, write a short narration script that sets up the story (for the first 1-2 shots only, not the whole movie)
- Create title cards:
  - Opening: "[Movie Title] — A film by [Director]" (we'll fill in the name later)
  - Any needed scene transition cards (e.g., "Meanwhile..." or "The next day...")
  - Ending: "The End"
- Write a prompt for a custom end-credits song

IMPORTANT: Every technical prompt MUST include the art style anchor: "${stylePrompt}"

Respond with ONLY valid JSON matching this exact structure:
{
  "movieTitle": "string",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "string (short, fun scene title)",
      "kidDescription": "string (plain language, exciting)",
      "technicalPrompt": "string (detailed video generation prompt with camera, lighting, style)",
      "durationSeconds": 6,
      "characterNames": ["string"],
      "cameraDirection": "string"
    }
  ],
  "narrationScript": "string or null",
  "titleCards": [
    {"position": "before_shot_1", "text": "string", "durationSeconds": 3}
  ],
  "creditsSongPrompt": "string"
}`;

    await logProgress(
      "calling",
      "Sending to Claude API (model: claude-sonnet-4-6)...",
      "This is the longest step — Claude is writing your entire screenplay with 12 detailed shots."
    );

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16384,
      messages: [{ role: "user", content: prompt }],
    });

    await logProgress("received", "Screenplay received! Parsing the response...");

    const responseText = response.content[0].type === "text" ? response.content[0].text : "";

    // Strip markdown code fences if present
    let jsonStr = responseText.trim();
    // Try to extract JSON from code blocks
    const codeBlockMatch = jsonStr.match(/`{3}(?:json)?\s*([\s\S]*?)`{3}/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    } else {
      // Try to find the JSON object directly
      const jsonStart = jsonStr.indexOf('{');
      const jsonEnd = jsonStr.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
      }
    }

    let screenplay;
    try {
      screenplay = JSON.parse(jsonStr.trim());
    } catch (e) {
      await logProgress("error", "Failed to parse Claude's response as JSON", responseText.substring(0, 300));
      throw e;
    }

    await logProgress("parsed", `Screenplay parsed! Movie title: "${screenplay.movieTitle}" — ${screenplay.scenes.length} shots found.`);

    // Update character styles
    for (const character of movie.characters) {
      const inScenes = screenplay.scenes.filter((s) => s.characterNames.includes(character.name));
      if (inScenes.length > 0) {
        await prisma.character.update({
          where: { id: character.id },
          data: { styleDescription: `${character.name} in ${stylePrompt}` },
        });
      }
    }

    // Create shots
    for (const scene of screenplay.scenes) {
      const shot = await prisma.shot.create({
        data: {
          movieId,
          sequenceNumber: scene.sceneNumber,
          kidDescription: scene.kidDescription,
          technicalPrompt: scene.technicalPrompt,
          durationSeconds: scene.durationSeconds,
          status: "draft",
        },
      });

      for (const charName of scene.characterNames) {
        const character = movie.characters.find((c) => c.name === charName);
        if (character) {
          await prisma.shotCharacter.create({
            data: { shotId: shot.id, characterId: character.id },
          });
        }
      }

      await logProgress("shot", `Shot ${scene.sceneNumber} of ${screenplay.scenes.length} created: "${scene.title}"`, scene.kidDescription);
    }

    // Create title cards
    await logProgress("titles", "Creating title cards...");
    for (const card of screenplay.titleCards) {
      await prisma.titleCard.create({
        data: { movieId, position: card.position, text: card.text, durationSeconds: card.durationSeconds },
      });
    }

    // Update movie
    await prisma.movie.update({
      where: { id: movieId },
      data: {
        title: screenplay.movieTitle,
        screenplay: JSON.parse(JSON.stringify(screenplay)),
        narrationScript: screenplay.narrationScript,
        creditsSongLyrics: screenplay.creditsSongPrompt,
        status: "planning",
      },
    });

    await logProgress("complete", "All done! Your storyboard is ready.");
    console.log(`Screenplay generation complete for ${movieId}`);
  } catch (error) {
    console.error(`Screenplay generation failed for ${movieId}:`, error);
    await logProgress("error", `Error: ${error.message || String(error)}`).catch(() => {});
    await prisma.movie.update({ where: { id: movieId }, data: { status: "failed" } }).catch(() => {});
  } finally {
    await prisma.$disconnect();
  }
}

run();
