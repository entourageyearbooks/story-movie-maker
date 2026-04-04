import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { storyTemplates, stylePresets } from "@/lib/story-templates";

const anthropic = new Anthropic();

interface ScreenplayScene {
  sceneNumber: number;
  title: string;
  kidDescription: string;
  technicalPrompt: string;
  durationSeconds: number;
  characterNames: string[];
  cameraDirection: string;
}

interface ScreenplayOutput {
  movieTitle: string;
  scenes: ScreenplayScene[];
  narrationScript: string | null;
  titleCards: { position: string; text: string; durationSeconds: number }[];
  creditsSongPrompt: string;
}

const STYLE_PROMPTS: Record<string, string> = {
  storybook_illustration:
    "warm children's storybook illustration style, soft painterly textures, gentle lighting, watercolor-like backgrounds",
  colorful_cartoon:
    "bright colorful cartoon animation style, bold outlines, vibrant saturated colors, smooth cel-shaded look",
  comic_book:
    "dynamic comic book style, strong ink outlines, dramatic angles, halftone dot textures, bold action lines",
};

export async function generateScreenplay(movieId: string): Promise<void> {
  const movie = await prisma.movie.findUniqueOrThrow({
    where: { id: movieId },
    include: { characters: true },
  });

  const template = storyTemplates.find((t) => t.id === movie.storyType);
  if (!template) throw new Error(`Unknown story type: ${movie.storyType}`);

  const stylePrompt = STYLE_PROMPTS[movie.stylePreset];
  const answers = movie.storyAnswers as Record<string, string>;

  // Build character descriptions for prompts
  const characterDescriptions = movie.characters
    .map((c) => `- ${c.name}${c.referenceImageUrl ? " (has reference image)" : ""}`)
    .join("\n");

  // Stage 1: Story Analysis + Screenplay Generation
  const screenplayResponse = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a children's movie director creating a short animated film. Generate a complete screenplay for a 90-second movie.

STORY TYPE: ${template.title}
STORY STRUCTURE: ${template.structure.join(" → ")}

KID'S ANSWERS:
${Object.entries(answers)
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}

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
- Write a prompt for a custom end-credits song: describe the mood, characters, and theme for a 60-75 second kids' song with singable lyrics

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
}`,
      },
    ],
  });

  const responseText =
    screenplayResponse.content[0].type === "text"
      ? screenplayResponse.content[0].text
      : "";

  // Parse the JSON from the response (handle markdown code blocks)
  let jsonStr = responseText;
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  const screenplay: ScreenplayOutput = JSON.parse(jsonStr.trim());

  // Update character style descriptions
  for (const character of movie.characters) {
    const relevantScenes = screenplay.scenes.filter((s) =>
      s.characterNames.includes(character.name)
    );
    if (relevantScenes.length > 0) {
      // Extract how the character is described in the technical prompts
      await prisma.character.update({
        where: { id: character.id },
        data: {
          styleDescription: `${character.name} in ${stylePrompt}`,
        },
      });
    }
  }

  // Create shots in the database
  for (const scene of screenplay.scenes) {
    const shot = await prisma.shot.create({
      data: {
        movieId: movie.id,
        sequenceNumber: scene.sceneNumber,
        kidDescription: scene.kidDescription,
        technicalPrompt: scene.technicalPrompt,
        durationSeconds: scene.durationSeconds,
        status: "draft",
      },
    });

    // Link characters to shots
    for (const charName of scene.characterNames) {
      const character = movie.characters.find((c) => c.name === charName);
      if (character) {
        await prisma.shotCharacter.create({
          data: {
            shotId: shot.id,
            characterId: character.id,
          },
        });
      }
    }
  }

  // Create title cards
  for (const card of screenplay.titleCards) {
    await prisma.titleCard.create({
      data: {
        movieId: movie.id,
        position: card.position,
        text: card.text,
        durationSeconds: card.durationSeconds,
      },
    });
  }

  // Update movie with screenplay data
  await prisma.movie.update({
    where: { id: movie.id },
    data: {
      title: screenplay.movieTitle,
      screenplay: JSON.parse(JSON.stringify(screenplay)),
      narrationScript: screenplay.narrationScript,
      creditsSongLyrics: screenplay.creditsSongPrompt,
      status: "planning",
    },
  });
}
