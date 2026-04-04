import { fal } from "@fal-ai/client";
import { prisma } from "@/lib/prisma";

fal.config({ credentials: process.env.FAL_KEY });

const MAX_RETRIES = 2;
const VIDEO_ENDPOINT = "fal-ai/kling-video/v2/master/image-to-video";

// Use generic fal.run to avoid strict SDK type constraints on endpoint-specific inputs
async function generateVideoClip(
  prompt: string,
  durationSeconds: number,
  imageUrl?: string | null
): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const input: any = {
    prompt,
    duration: Math.min(Math.max(durationSeconds, 5), 10),
    aspect_ratio: "16:9",
  };

  if (imageUrl) {
    input.image_url = imageUrl;
  }

  const result = await fal.subscribe(VIDEO_ENDPOINT, { input });

  // Extract video URL from response
  const data = result.data as Record<string, unknown> | null;
  if (data && typeof data.video === "object" && data.video !== null) {
    return (data.video as { url: string }).url;
  }
  return null;
}

export async function generateVideos(movieId: string): Promise<void> {
  const shots = await prisma.shot.findMany({
    where: { movieId, status: { not: "complete" } },
    orderBy: { sequenceNumber: "asc" },
    include: { characters: { include: { character: true } } },
  });

  for (const shot of shots) {
    let attempts = 0;
    let success = false;

    while (attempts < MAX_RETRIES + 1 && !success) {
      try {
        await prisma.shot.update({
          where: { id: shot.id },
          data: { status: "filming" },
        });

        const videoUrl = await generateVideoClip(
          shot.technicalPrompt || shot.kidDescription,
          shot.durationSeconds,
          shot.previewImageUrl
        );

        if (videoUrl) {
          const cost = shot.durationSeconds * 0.07;

          await prisma.shot.update({
            where: { id: shot.id },
            data: {
              videoUrl,
              status: "complete",
              generationCost: { increment: cost },
            },
          });

          await prisma.movie.update({
            where: { id: movieId },
            data: {
              generationCostTotal: { increment: cost },
            },
          });

          success = true;
        } else {
          throw new Error("No video URL in response");
        }
      } catch (error) {
        attempts++;
        console.error(
          `Video generation attempt ${attempts} failed for shot ${shot.sequenceNumber}:`,
          error
        );

        if (attempts >= MAX_RETRIES + 1) {
          await prisma.shot.update({
            where: { id: shot.id },
            data: { status: "failed" },
          });
        }
      }
    }
  }
}

export async function reshootShot(shotId: string): Promise<void> {
  const shot = await prisma.shot.findUniqueOrThrow({
    where: { id: shotId },
  });

  if (shot.reshootsRemaining <= 0) {
    throw new Error("No reshoots remaining");
  }

  await prisma.shot.update({
    where: { id: shotId },
    data: {
      reshootsRemaining: { decrement: 1 },
      status: "filming",
      videoUrl: null,
    },
  });

  try {
    const videoUrl = await generateVideoClip(
      shot.technicalPrompt || shot.kidDescription,
      shot.durationSeconds,
      shot.previewImageUrl
    );

    if (videoUrl) {
      const cost = shot.durationSeconds * 0.07;
      await prisma.shot.update({
        where: { id: shotId },
        data: {
          videoUrl,
          status: "complete",
          generationCost: { increment: cost },
        },
      });

      await prisma.movie.update({
        where: { id: shot.movieId },
        data: {
          generationCostTotal: { increment: cost },
        },
      });
    } else {
      throw new Error("No video URL in response");
    }
  } catch (error) {
    console.error(`Reshoot failed for shot ${shotId}:`, error);
    await prisma.shot.update({
      where: { id: shotId },
      data: { status: "failed" },
    });
  }
}
