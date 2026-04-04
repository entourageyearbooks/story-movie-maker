import { NextRequest, NextResponse } from "next/server";
import { reshootShot } from "@/lib/ai/video-generation";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ shotId: string }> }
) {
  const { shotId } = await params;

  try {
    // Run reshoot in the background
    reshootShot(shotId).catch((error) => {
      console.error(`Reshoot failed for shot ${shotId}:`, error);
    });

    const shot = await prisma.shot.findUniqueOrThrow({
      where: { id: shotId },
      select: {
        id: true,
        status: true,
        reshootsRemaining: true,
        videoUrl: true,
      },
    });

    return NextResponse.json(shot);
  } catch (error) {
    console.error("Reshoot failed:", error);
    return NextResponse.json(
      { error: "Failed to reshoot" },
      { status: 500 }
    );
  }
}
