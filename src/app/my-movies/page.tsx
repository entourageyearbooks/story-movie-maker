import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { storyTemplates, stylePresets } from "@/lib/story-templates";

export const metadata: Metadata = {
  title: "My Movies - Story Movie Maker",
};

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-stone-200", text: "text-stone-600", label: "Draft" },
  planning: { bg: "bg-amber-200", text: "text-amber-700", label: "Planning" },
  filming: { bg: "bg-amber-300", text: "text-amber-800", label: "Filming" },
  assembling: { bg: "bg-blue-200", text: "text-blue-700", label: "Assembling" },
  complete: { bg: "bg-green-200", text: "text-green-700", label: "Complete" },
  failed: { bg: "bg-red-200", text: "text-red-700", label: "Failed" },
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function MyMoviesPage() {
  // TODO: Replace with Cognito session lookup
  const user = await prisma.user.findFirst();

  if (!user) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <span className="text-6xl mb-6">🎬</span>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-stone-800 mb-3">
          No movies yet!
        </h1>
        <p className="text-stone-500 text-lg mb-8">
          Create your first movie to get started.
        </p>
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] text-lg px-8 py-3 bg-amber-400 hover:bg-amber-500 text-white rounded-full font-bold transition-colors shadow-lg"
        >
          Make a movie
        </Link>
      </main>
    );
  }

  const movies = await prisma.movie.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      shots: {
        where: { sequenceNumber: 1 },
        select: { previewImageUrl: true },
        take: 1,
      },
    },
  });

  const templateMap = new Map(storyTemplates.map((t) => [t.id, t]));
  const styleMap = new Map(stylePresets.map((s) => [s.id, s]));

  return (
    <main className="flex-1 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-stone-800">
            My Movies
          </h1>
          <Link
            href="/"
            className="font-[family-name:var(--font-heading)] text-base px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-white rounded-full font-bold transition-colors shadow-md"
          >
            + New movie
          </Link>
        </div>

        {movies.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-6">🎬</span>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-stone-700 mb-3">
              No movies yet!
            </h2>
            <p className="text-stone-500 text-lg mb-8">
              Pick a story type and make your first movie.
            </p>
            <Link
              href="/"
              className="font-[family-name:var(--font-heading)] text-lg px-8 py-3 bg-amber-400 hover:bg-amber-500 text-white rounded-full font-bold transition-colors shadow-lg"
            >
              Get started
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => {
              const template = templateMap.get(movie.storyType);
              const style = styleMap.get(movie.stylePreset);
              const thumbnail = movie.shots[0]?.previewImageUrl;
              const badge = STATUS_BADGE[movie.status] ?? STATUS_BADGE.draft;

              return (
                <Link
                  key={movie.id}
                  href={`/storyboard/${movie.id}`}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border-2 border-stone-200 hover:border-amber-400 overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 bg-stone-100 flex items-center justify-center">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={movie.title || "Movie thumbnail"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl">
                        {template?.icon ?? "🎬"}
                      </span>
                    )}
                    {/* Status badge */}
                    <span
                      className={`absolute top-2 right-2 text-xs font-bold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text} ${
                        movie.status === "filming" ? "animate-pulse" : ""
                      }`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-stone-800 mb-1 line-clamp-1">
                      {movie.title || "Untitled Movie"}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-stone-500 mb-2">
                      <span>{template?.title ?? movie.storyType.replace(/_/g, " ")}</span>
                      <span>&middot;</span>
                      <span>{style?.title ?? movie.stylePreset.replace(/_/g, " ")}</span>
                    </div>
                    <p className="text-xs text-stone-400">
                      {dateFormatter.format(new Date(movie.createdAt))}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
