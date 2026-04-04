import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateScreenplay } from "@/lib/ai/screenplay";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { StoryType, StylePreset } from "@prisma/client";

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

async function uploadToS3(
  file: File,
  key: string
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );
  return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const storyType = formData.get("storyType") as StoryType;
    const stylePreset = formData.get("stylePreset") as StylePreset;
    const answers = JSON.parse(formData.get("answers") as string);
    const narrationEnabled = formData.get("narrationEnabled") === "true";

    // TODO: Get actual user from Cognito session
    // For now, create or find a dev user
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

    // Upload character images to S3 and create character records
    const imageFields = Object.keys(answers).filter(
      (k) => k.endsWith("_image") || k.endsWith("_photo")
    );

    // Find image files in formData (they're uploaded as separate fields)
    const characterImages: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        const s3Key = `movies/${movie.id}/characters/${key}-${Date.now()}.${value.name.split(".").pop()}`;
        const url = await uploadToS3(value, s3Key);
        characterImages[key] = url;
      }
    }

    // Create character records from answers
    // Hero/captain is always a character
    const heroNameKey = storyType === "monster_battle" ? "hero_name" : "captain_name";
    const heroImageKey = storyType === "monster_battle" ? "hero_image" : "captain_image";

    if (answers[heroNameKey]) {
      await prisma.character.create({
        data: {
          movieId: movie.id,
          name: answers[heroNameKey],
          rawImageUrl: characterImages[heroImageKey] || null,
          referenceImageUrl: characterImages[heroImageKey] || null,
        },
      });
    }

    // Monster (for monster_battle)
    if (storyType === "monster_battle" && answers.monster_name) {
      await prisma.character.create({
        data: {
          movieId: movie.id,
          name: answers.monster_name,
          rawImageUrl: characterImages.monster_image || null,
          referenceImageUrl: characterImages.monster_image || null,
        },
      });
    }

    // Generate screenplay and shot plan asynchronously
    // For now, do it synchronously (move to Trigger.dev later)
    try {
      await generateScreenplay(movie.id);
    } catch (error) {
      console.error("Screenplay generation failed:", error);
      // Movie is still created, just without a screenplay yet
    }

    return NextResponse.json({ movieId: movie.id });
  } catch (error) {
    console.error("Failed to create movie:", error);
    return NextResponse.json(
      { error: "Failed to create movie" },
      { status: 500 }
    );
  }
}
