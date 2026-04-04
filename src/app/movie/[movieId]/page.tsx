import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function MoviePlayerPage({
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
      },
    },
  });

  if (!movie) notFound();

  const totalCost = movie.generationCostTotal.toFixed(2);

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 bg-stone-900">
      <div className="w-full max-w-3xl">
        {/* Movie title */}
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-white mb-2">
            {movie.title || "Your Movie"}
          </h1>
          <p className="font-[family-name:var(--font-handwritten)] text-xl text-stone-400">
            A film by you
          </p>
        </div>

        {/* Video player */}
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl mb-8 aspect-video flex items-center justify-center">
          {movie.finalVideoUrl ? (
            <video
              src={movie.finalVideoUrl}
              controls
              autoPlay
              className="w-full h-full"
            />
          ) : movie.status === "complete" ? (
            <div className="text-center text-stone-500">
              <span className="text-5xl block mb-4">🎬</span>
              <p className="text-lg">
                Your movie is ready! Video assembly coming soon.
              </p>
              <p className="text-sm mt-2">
                For now, you can view individual shots on the storyboard.
              </p>
            </div>
          ) : movie.status === "filming" ? (
            <div className="text-center text-amber-400">
              <span className="text-5xl block mb-4 animate-pulse">🎥</span>
              <p className="text-lg">Your movie is still being filmed...</p>
            </div>
          ) : (
            <div className="text-center text-stone-500">
              <span className="text-5xl block mb-4">📝</span>
              <p className="text-lg">
                Your movie hasn&apos;t been filmed yet.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href={`/storyboard/${movie.id}`}
            className="font-[family-name:var(--font-heading)] text-lg px-8 py-3 bg-amber-400 hover:bg-amber-500 text-white rounded-full font-semibold text-center transition-colors shadow-md"
          >
            🎬 Back to Storyboard
          </Link>
          {movie.finalVideoUrl && (
            <a
              href={movie.finalVideoUrl}
              download
              className="font-[family-name:var(--font-heading)] text-lg px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold text-center transition-colors shadow-md"
            >
              ⬇️ Download Movie
            </a>
          )}
          <Link
            href="/"
            className="font-[family-name:var(--font-heading)] text-lg px-8 py-3 bg-stone-700 hover:bg-stone-600 text-white rounded-full font-semibold text-center transition-colors shadow-md"
          >
            🎬 Make Another Movie
          </Link>
        </div>

        {/* Movie stats */}
        <div className="bg-stone-800 rounded-xl p-6 text-stone-400 text-sm">
          <h3 className="font-[family-name:var(--font-heading)] text-stone-300 font-semibold mb-3">
            Movie Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-stone-500">Shots</p>
              <p className="text-lg text-stone-300">{movie.shots.length}</p>
            </div>
            <div>
              <p className="text-stone-500">Duration</p>
              <p className="text-lg text-stone-300">
                {Math.round(
                  movie.shots.reduce((sum, s) => sum + s.durationSeconds, 0)
                )}
                s
              </p>
            </div>
            <div>
              <p className="text-stone-500">Characters</p>
              <p className="text-lg text-stone-300">
                {movie.characters.length}
              </p>
            </div>
            <div>
              <p className="text-stone-500">Generation Cost</p>
              <p className="text-lg text-stone-300">${totalCost}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
