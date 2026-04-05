import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  const { movieId } = await params;

  console.log(`[generate] Received generate request for movie ${movieId}`);

  // Instead of running the heavy screenplay generation here,
  // we return immediately and the client will call a separate worker endpoint
  return NextResponse.json({ status: "accepted", movieId });
}
