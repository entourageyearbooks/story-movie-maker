import { fal } from "@fal-ai/client";
import { prisma } from "@/lib/prisma";
import type { Shot, ShotCharacter, Character } from "@prisma/client";

fal.config({ credentials: process.env.FAL_KEY });

type ShotWithCharacters = Shot & {
  characters: (ShotCharacter & { character: Character })[];
};

const IMAGE_ENDPOINT = "fal-ai/kling-image/o3/text-to-image";

export async function generatePreviewImages(
  movieId: string,
  shots: ShotWithCharacters[]
): Promise<void> {
  // Generate preview images using Kling Image O3
  // Each preview becomes the first frame of the video (shared MVL framework)
  for (const shot of shots) {
    try {
      // Adapt the technical prompt for still image generation
      const imagePrompt = shot.technicalPrompt
        ? shot.technicalPrompt.replace(/tracking shot|camera movement|camera pan|zoom/gi, "")
        : shot.kidDescription;

      // Collect reference images for characters in this shot
      const referenceImages = shot.characters
        .map((sc) => sc.character.referenceImageUrl)
        .filter(Boolean) as string[];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const input: any = {
        prompt: imagePrompt,
        aspect_ratio: "16:9",
      };

      // If we have character reference images, include as reference
      if (referenceImages.length > 0) {
        input.image_url = referenceImages[0];
      }

      const result = await fal.subscribe(IMAGE_ENDPOINT, { input });

      // Extract image URL from response
      const data = result.data as Record<string, unknown> | null;
      let imageUrl: string | null = null;

      if (data && Array.isArray(data.images) && data.images.length > 0) {
        imageUrl = (data.images[0] as { url: string }).url;
      }

      if (imageUrl) {
        await prisma.shot.update({
          where: { id: shot.id },
          data: {
            previewImageUrl: imageUrl,
            status: "preview_generated",
          },
        });
      }
    } catch (error) {
      console.error(`Failed to generate preview for shot ${shot.sequenceNumber}:`, error);
      // Continue with other shots even if one fails
    }
  }
}
