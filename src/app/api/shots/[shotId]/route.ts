import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ shotId: string }> }
) {
  const { shotId } = await params;
  const { kidDescription } = await request.json();

  const shot = await prisma.shot.findUniqueOrThrow({
    where: { id: shotId },
    include: {
      movie: true,
      characters: { include: { character: true } },
    },
  });

  // Translate kid-facing description into technical prompt using Claude
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `You are a video generation prompt engineer. Translate this kid-friendly scene description into a detailed technical video generation prompt.

KID'S DESCRIPTION: "${kidDescription}"

PREVIOUS TECHNICAL PROMPT: "${shot.technicalPrompt}"

CHARACTERS IN THIS SCENE: ${shot.characters.map((sc) => sc.character.name).join(", ")}

MOVIE ART STYLE: ${shot.movie.stylePreset}

Keep the same camera direction, art style, and character references from the previous prompt. Only update the action/content to match the new kid description.

Respond with ONLY the technical prompt text, nothing else.`,
      },
    ],
  });

  const newTechnicalPrompt =
    response.content[0].type === "text" ? response.content[0].text : "";

  const updated = await prisma.shot.update({
    where: { id: shotId },
    data: {
      kidDescription,
      technicalPrompt: newTechnicalPrompt,
      // Reset preview since description changed
      previewImageUrl: null,
      status: "draft",
    },
  });

  return NextResponse.json({
    id: updated.id,
    kidDescription: updated.kidDescription,
    technicalPrompt: updated.technicalPrompt,
  });
}
