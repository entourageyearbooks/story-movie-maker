// Film worker: generates preview images and video clips for a movie
// Usage: node film-worker.mjs <movieId>

import { PrismaClient } from "@prisma/client";
import { fal } from "@fal-ai/client";

const prisma = new PrismaClient();
fal.config({ credentials: process.env.FAL_KEY });

const movieId = process.argv[2];
if (!movieId) {
  console.error("Usage: node film-worker.mjs <movieId>");
  process.exit(1);
}

const IMAGE_ENDPOINT = "fal-ai/kling-image/o3/text-to-image";
const VIDEO_ENDPOINT = "fal-ai/kling-video/v2/master/image-to-video";
const MAX_RETRIES = 2;

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

async function generatePreview(shot) {
  const imagePrompt = shot.technicalPrompt
    ? shot.technicalPrompt.replace(/tracking shot|camera movement|camera pan|zoom/gi, "")
    : shot.kidDescription;

  const input = { prompt: imagePrompt, aspect_ratio: "16:9" };

  const result = await fal.subscribe(IMAGE_ENDPOINT, { input });
  const data = result.data;
  if (data && Array.isArray(data.images) && data.images.length > 0) {
    return data.images[0].url;
  }
  return null;
}

async function generateVideo(shot) {
  // Kling only accepts duration of 5 or 10 seconds
  const duration = shot.durationSeconds >= 8 ? 10 : 5;
  const input = {
    prompt: shot.technicalPrompt || shot.kidDescription,
    duration,
    aspect_ratio: "16:9",
  };
  if (shot.previewImageUrl) {
    input.image_url = shot.previewImageUrl;
  }

  const result = await fal.subscribe(VIDEO_ENDPOINT, { input });
  const data = result.data;
  if (data && typeof data.video === "object" && data.video !== null) {
    return data.video.url;
  }
  return null;
}

async function run() {
  try {
    console.log(`[film-worker] Starting for movie ${movieId}`);
    console.log(`[film-worker] FAL_KEY set: ${!!process.env.FAL_KEY}`);

    const shots = await prisma.shot.findMany({
      where: { movieId },
      orderBy: { sequenceNumber: "asc" },
      include: { characters: { include: { character: true } } },
    });

    await logProgress("film_start", `Starting to film ${shots.length} shots...`);

    // Step 1: Generate preview images
    for (const shot of shots) {
      if (!shot.previewImageUrl) {
        try {
          await logProgress("preview", `Generating preview for Shot ${shot.sequenceNumber}...`);
          const imageUrl = await generatePreview(shot);
          if (imageUrl) {
            await prisma.shot.update({
              where: { id: shot.id },
              data: { previewImageUrl: imageUrl, status: "preview_generated" },
            });
            await logProgress("preview_done", `Preview ready for Shot ${shot.sequenceNumber}!`);
          }
        } catch (error) {
          console.error(`Preview failed for shot ${shot.sequenceNumber}:`, error.message);
          await logProgress("preview_error", `Preview failed for Shot ${shot.sequenceNumber}: ${error.message}`);
        }
      }
    }

    // Step 2: Generate videos
    for (const shot of shots) {
      let attempts = 0;
      let success = false;

      // Refresh shot data (may have preview now)
      const freshShot = await prisma.shot.findUniqueOrThrow({ where: { id: shot.id } });

      while (attempts < MAX_RETRIES + 1 && !success) {
        try {
          await prisma.shot.update({ where: { id: shot.id }, data: { status: "filming" } });
          await logProgress("filming", `Filming Shot ${shot.sequenceNumber}: "${shot.kidDescription.substring(0, 50)}..."`);

          const videoUrl = await generateVideo(freshShot);

          if (videoUrl) {
            const cost = freshShot.durationSeconds * 0.07;
            await prisma.shot.update({
              where: { id: shot.id },
              data: { videoUrl, status: "complete", generationCost: { increment: cost } },
            });
            await prisma.movie.update({
              where: { id: movieId },
              data: { generationCostTotal: { increment: cost } },
            });
            await logProgress("filmed", `Shot ${shot.sequenceNumber} filmed!`);
            success = true;
          } else {
            throw new Error("No video URL in response");
          }
        } catch (error) {
          attempts++;
          const errDetail = error.body ? JSON.stringify(error.body).substring(0, 300) : error.message;
          console.error(`Video attempt ${attempts} failed for shot ${shot.sequenceNumber}:`, errDetail);
          if (attempts >= MAX_RETRIES + 1) {
            await prisma.shot.update({ where: { id: shot.id }, data: { status: "failed" } });
            await logProgress("film_error", `Shot ${shot.sequenceNumber} failed after ${attempts} attempts: ${error.message}`, errDetail);
          }
        }
      }
    }

    // Check results
    const finalShots = await prisma.shot.findMany({ where: { movieId }, select: { status: true } });
    const completedCount = finalShots.filter(s => s.status === "complete").length;
    const failedCount = finalShots.filter(s => s.status === "failed").length;

    if (completedCount === finalShots.length) {
      await prisma.movie.update({ where: { id: movieId }, data: { status: "complete" } });
      await logProgress("film_complete", `All ${completedCount} shots filmed! Your movie is ready.`);
    } else {
      await prisma.movie.update({ where: { id: movieId }, data: { status: "complete" } });
      await logProgress("film_complete", `Filming done: ${completedCount} succeeded, ${failedCount} failed.`);
    }

    console.log(`[film-worker] Done. ${completedCount}/${finalShots.length} shots completed.`);
  } catch (error) {
    console.error(`[film-worker] Fatal error:`, error);
    await logProgress("error", `Filming failed: ${error.message}`).catch(() => {});
    await prisma.movie.update({ where: { id: movieId }, data: { status: "failed" } }).catch(() => {});
  } finally {
    await prisma.$disconnect();
  }
}

run();
