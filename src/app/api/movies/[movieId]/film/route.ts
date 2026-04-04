import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePreviewImages } from "@/lib/ai/preview-images";
import { generateVideos } from "@/lib/ai/video-generation";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  const { movieId } = await params;

  // Update movie status
  await prisma.movie.update({
    where: { id: movieId },
    data: { status: "filming" },
  });

  // Run the generation pipeline in the background
  // In production, this would be handled by Trigger.dev
  // For now, run async without blocking the response
  processMovie(movieId).catch((error) => {
    console.error(`Movie ${movieId} processing failed:`, error);
    prisma.movie.update({
      where: { id: movieId },
      data: { status: "failed" },
    });
  });

  return NextResponse.json({ status: "filming" });
}

async function processMovie(movieId: string) {
  const movie = await prisma.movie.findUniqueOrThrow({
    where: { id: movieId },
    include: {
      shots: {
        orderBy: { sequenceNumber: "asc" },
        include: { characters: { include: { character: true } } },
      },
      characters: true,
    },
  });

  // Step 1: Generate preview images for shots that don't have them
  const shotsNeedingPreviews = movie.shots.filter((s) => !s.previewImageUrl);
  if (shotsNeedingPreviews.length > 0) {
    await generatePreviewImages(movie.id, shotsNeedingPreviews);
  }

  // Step 2: Generate video for each shot
  await generateVideos(movie.id);

  // Step 3: Assemble the final movie
  // TODO: FFmpeg assembly pipeline
  await prisma.movie.update({
    where: { id: movieId },
    data: { status: "complete" },
  });
}
