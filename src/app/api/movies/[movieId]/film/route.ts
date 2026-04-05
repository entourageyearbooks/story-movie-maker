import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  const { movieId } = await params;

  await prisma.movie.update({
    where: { id: movieId },
    data: { status: "filming" },
  });

  // The client will trigger the film worker via the worker server (port 9091)
  // This route just updates the status
  return NextResponse.json({ status: "filming", movieId });
}
