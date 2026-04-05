import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  const { movieId } = await params;

  const movie = await prisma.movie.findUniqueOrThrow({
    where: { id: movieId },
    select: { id: true, status: true, progressLog: true },
  });

  return NextResponse.json({
    status: movie.status,
    log: movie.progressLog || [],
  });
}
