import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Storyboard } from "./storyboard";

export default async function StoryboardPage({
  params,
}: {
  params: Promise<{ movieId: string }>;
}) {
  const { movieId } = await params;

  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    include: {
      characters: true,
      shots: {
        orderBy: { sequenceNumber: "asc" },
        include: {
          characters: {
            include: { character: true },
          },
        },
      },
      titleCards: true,
    },
  });

  if (!movie) notFound();

  return <Storyboard movie={movie} />;
}
