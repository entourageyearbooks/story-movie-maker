import { fal } from "@fal-ai/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, "..", "public", "images", "story-types");

fal.config({ credentials: process.env.FAL_KEY });

const styleBase =
  "whimsical watercolor illustration, warm golden lighting, magical sparkles, children's storybook art style, soft painterly textures, no text, no words, no letters";

const storyIcons = [
  {
    id: "monster_battle",
    prompt: `A brave young knight facing a friendly-looking dragon in an enchanted forest clearing, ${styleBase}`,
  },
  {
    id: "space_adventure",
    prompt: `A colorful rocket ship blasting off into a starry sky with planets and nebulae, ${styleBase}`,
  },
  {
    id: "fairy_tale_quest",
    prompt: `A magical open storybook with a glowing enchanted castle rising from its pages, fairy dust swirling around, ${styleBase}`,
  },
  {
    id: "superhero_origin",
    prompt: `A kid in a homemade superhero cape standing on a rooftop with a glowing city skyline behind them, ${styleBase}`,
  },
  {
    id: "robot_best_friend",
    prompt: `A cute friendly robot with glowing eyes sitting next to a kid in a messy inventor's workshop, ${styleBase}`,
  },
  {
    id: "haunted_house_mystery",
    prompt: `A spooky but charming old Victorian mansion at twilight with glowing windows and friendly ghosts peeking out, ${styleBase}`,
  },
];

async function generateIcon(story) {
  console.log(`Generating: ${story.id}...`);
  const result = await fal.subscribe("fal-ai/kling-image/o3/text-to-image", {
    input: {
      prompt: story.prompt,
      aspect_ratio: "1:1",
    },
  });

  const imageUrl = result.data.images[0].url;
  console.log(`  Got URL: ${imageUrl}`);

  const response = await fetch(imageUrl);
  const buffer = Buffer.from(await response.arrayBuffer());
  const outputPath = path.join(outputDir, `${story.id}.png`);
  fs.writeFileSync(outputPath, buffer);
  console.log(`  Saved: ${outputPath}`);
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Generating ${storyIcons.length} story type icons...\n`);

  for (const story of storyIcons) {
    await generateIcon(story);
  }

  console.log("\nDone! All icons saved to public/images/story-types/");
}

main().catch(console.error);
