import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  const { movieId } = await params;

  const movie = await prisma.movie.findUniqueOrThrow({
    where: { id: movieId },
    select: { id: true, status: true, finalVideoUrl: true },
  });

  const shots = await prisma.shot.findMany({
    where: { movieId },
    orderBy: { sequenceNumber: "asc" },
    select: {
      id: true,
      sequenceNumber: true,
      status: true,
      videoUrl: true,
      previewImageUrl: true,
      reshootsRemaining: true,
    },
  });

  return NextResponse.json({ movie, shots });
}
