import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { StoryType, StylePreset } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    console.log("[movies] POST: Parsing request...");
    const body = await request.json();
    const { storyType, stylePreset, answers, narrationEnabled } = body as {
      storyType: StoryType;
      stylePreset: StylePreset;
      answers: Record<string, string>;
      narrationEnabled: boolean;
    };

    console.log("[movies] Story type:", storyType, "Style:", stylePreset);

    // TODO: Get actual user from Cognito session
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          cognitoId: "dev-user",
          email: "dev@example.com",
          name: "Dev User",
        },
      });
    }

    // Create the movie
    const movie = await prisma.movie.create({
      data: {
        userId: user.id,
        storyType,
        stylePreset,
        storyAnswers: answers,
        narrationEnabled,
        status: "draft",
      },
    });
    console.log("[movies] Movie created:", movie.id);

    // Create character records based on story type
    const storyTypeStr = storyType as string;
    const heroNameKey = storyTypeStr === "space_adventure"
      ? "captain_name"
      : storyTypeStr === "robot_best_friend"
        ? "kid_name"
        : "hero_name";

    if (answers[heroNameKey]) {
      await prisma.character.create({
        data: {
          movieId: movie.id,
          name: answers[heroNameKey],
        },
      });
    }

    if (storyTypeStr === "monster_battle" && answers.monster_name) {
      await prisma.character.create({
        data: {
          movieId: movie.id,
          name: answers.monster_name,
        },
      });
    }

    console.log("[movies] Movie and characters created:", movie.id);

    // Return immediately -- the client will trigger /generate separately
    return NextResponse.json({ movieId: movie.id });
  } catch (error) {
    console.error("[movies] Failed to create movie:", error);
    return NextResponse.json(
      { error: "Failed to create movie" },
      { status: 500 }
    );
  }
}
