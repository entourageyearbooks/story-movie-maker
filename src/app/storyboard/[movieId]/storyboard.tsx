"use client";

import { useState } from "react";
import type { Movie, Shot, Character, ShotCharacter, TitleCard } from "@prisma/client";

type ShotWithCharacters = Shot & {
  characters: (ShotCharacter & { character: Character })[];
};

type MovieWithRelations = Movie & {
  characters: Character[];
  shots: ShotWithCharacters[];
  titleCards: TitleCard[];
};

// Deterministic "random" rotation for cards based on index
function cardRotation(index: number): string {
  const rotations = [-2, 1.5, -1, 2, -0.5, 1, -1.5, 0.5, -2.5, 1.8, -0.8, 2.2];
  return `${rotations[index % rotations.length]}deg`;
}

// Pin colors cycle
const PIN_COLORS = [
  "bg-red-400",
  "bg-blue-400",
  "bg-green-400",
  "bg-yellow-400",
  "bg-purple-400",
  "bg-pink-400",
];

export function Storyboard({ movie }: { movie: MovieWithRelations }) {
  const [selectedShot, setSelectedShot] = useState<ShotWithCharacters | null>(null);
  const [editingDescription, setEditingDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isFilming, setIsFilming] = useState(false);
  const [filmingProgress, setFilmingProgress] = useState(0);
  const [shots, setShots] = useState(movie.shots);

  const openShotDetail = (shot: ShotWithCharacters) => {
    setSelectedShot(shot);
    setEditingDescription(shot.kidDescription);
  };

  const closeShotDetail = () => {
    setSelectedShot(null);
    setEditingDescription("");
  };

  const navigateShot = (direction: "prev" | "next") => {
    if (!selectedShot) return;
    const currentIndex = shots.findIndex((s) => s.id === selectedShot.id);
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < shots.length) {
      const newShot = shots[newIndex];
      setSelectedShot(newShot);
      setEditingDescription(newShot.kidDescription);
    }
  };

  const saveDescription = async () => {
    if (!selectedShot || editingDescription === selectedShot.kidDescription) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/shots/${selectedShot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kidDescription: editingDescription }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const updated = await res.json();
      setShots((prev) =>
        prev.map((s) =>
          s.id === selectedShot.id
            ? { ...s, kidDescription: editingDescription, technicalPrompt: updated.technicalPrompt }
            : s
        )
      );
      setSelectedShot((prev) =>
        prev ? { ...prev, kidDescription: editingDescription } : null
      );
    } catch (error) {
      console.error("Failed to save:", error);
    }
    setIsSaving(false);
  };

  const startFilming = async () => {
    setIsFilming(true);
    setFilmingProgress(0);
    try {
      const res = await fetch(`/api/movies/${movie.id}/film`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to start filming");
      // Poll for progress
      pollFilmingProgress();
    } catch (error) {
      console.error("Failed to start filming:", error);
      setIsFilming(false);
    }
  };

  const pollFilmingProgress = async () => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/movies/${movie.id}/status`);
        const data = await res.json();
        const completedShots = data.shots.filter(
          (s: { status: string }) => s.status === "complete"
        ).length;
        setFilmingProgress(completedShots);

        // Update shot statuses
        setShots((prev) =>
          prev.map((shot) => {
            const updated = data.shots.find(
              (s: { id: string }) => s.id === shot.id
            );
            return updated ? { ...shot, ...updated } : shot;
          })
        );

        if (data.movie.status === "complete" || data.movie.status === "failed") {
          clearInterval(interval);
          setIsFilming(false);
          if (data.movie.status === "complete") {
            window.location.href = `/movie/${movie.id}`;
          }
        }
      } catch {
        clearInterval(interval);
      }
    }, 3000);
  };

  const reshootShot = async (shotId: string) => {
    try {
      const res = await fetch(`/api/shots/${shotId}/reshoot`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to reshoot");
      const updated = await res.json();
      setShots((prev) =>
        prev.map((s) => (s.id === shotId ? { ...s, ...updated } : s))
      );
    } catch (error) {
      console.error("Failed to reshoot:", error);
    }
  };

  return (
    <main className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b-2 border-stone-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-bold text-stone-800">
              {movie.title || "Your Movie"}
            </h1>
            <p className="text-stone-500 text-sm">
              {shots.length} shots &middot;{" "}
              {Math.round(shots.reduce((sum, s) => sum + s.durationSeconds, 0))}s
            </p>
          </div>
          <button
            onClick={startFilming}
            disabled={isFilming || movie.status === "filming"}
            className="font-[family-name:var(--font-heading)] text-lg px-8 py-3 bg-green-500 hover:bg-green-600 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-full font-bold transition-colors shadow-lg"
          >
            {isFilming
              ? `🎬 Filming Shot ${filmingProgress + 1} of ${shots.length}...`
              : "🎬 Film my movie!"}
          </button>
        </div>
      </div>

      {/* Corkboard */}
      <div
        className="flex-1 p-6 md:p-10"
        style={{
          backgroundColor: "#c4956a",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
        }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {shots.map((shot, index) => (
            <button
              key={shot.id}
              onClick={() => openShotDetail(shot)}
              className="relative bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 text-left overflow-hidden"
              style={{ transform: `rotate(${cardRotation(index)})` }}
            >
              {/* Push pin */}
              <div
                className={`absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${PIN_COLORS[index % PIN_COLORS.length]} shadow-md z-10`}
              />

              {/* Thumbnail area */}
              <div className="relative h-32 bg-stone-100 flex items-center justify-center">
                {shot.previewImageUrl ? (
                  <img
                    src={shot.previewImageUrl}
                    alt={shot.kidDescription}
                    className="w-full h-full object-cover"
                  />
                ) : shot.videoUrl ? (
                  <div className="text-center text-green-600">
                    <span className="text-2xl">✅</span>
                    <p className="text-xs mt-1">Filmed!</p>
                  </div>
                ) : (
                  <div className="text-center text-stone-400">
                    <span className="text-2xl">🎬</span>
                    <p className="text-xs mt-1">Shot {shot.sequenceNumber}</p>
                  </div>
                )}
                {/* Shot number badge */}
                <span className="absolute top-2 left-2 bg-stone-800 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {shot.sequenceNumber}
                </span>
                {/* Duration badge */}
                <span className="absolute top-2 right-2 bg-stone-800/70 text-white text-xs px-2 py-0.5 rounded-full">
                  {shot.durationSeconds}s
                </span>
              </div>

              {/* Card content */}
              <div className="p-3">
                <p className="font-[family-name:var(--font-handwritten)] text-lg text-stone-700 line-clamp-2">
                  {shot.kidDescription}
                </p>
                {/* Character tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {shot.characters.map((sc) => (
                    <span
                      key={sc.characterId}
                      className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full"
                    >
                      {sc.character.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status indicator */}
              {shot.status === "filming" && (
                <div className="absolute inset-0 bg-amber-400/20 flex items-center justify-center">
                  <span className="text-3xl animate-pulse">🎥</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Shot Detail Modal */}
      {selectedShot && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Preview area */}
            <div className="relative h-64 bg-stone-100 rounded-t-2xl flex items-center justify-center">
              {selectedShot.previewImageUrl ? (
                <img
                  src={selectedShot.previewImageUrl}
                  alt={selectedShot.kidDescription}
                  className="w-full h-full object-cover rounded-t-2xl"
                />
              ) : selectedShot.videoUrl ? (
                <video
                  src={selectedShot.videoUrl}
                  controls
                  className="w-full h-full object-cover rounded-t-2xl"
                />
              ) : (
                <div className="text-center text-stone-400">
                  <span className="text-5xl">🎬</span>
                  <p className="mt-2">Preview will appear here</p>
                </div>
              )}
              {/* Navigation arrows */}
              <button
                onClick={() => navigateShot("prev")}
                disabled={selectedShot.sequenceNumber === 1}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-stone-600 disabled:opacity-30 shadow-md"
              >
                ←
              </button>
              <button
                onClick={() => navigateShot("next")}
                disabled={selectedShot.sequenceNumber === shots.length}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-stone-600 disabled:opacity-30 shadow-md"
              >
                →
              </button>
              {/* Close button */}
              <button
                onClick={closeShotDetail}
                className="absolute top-2 right-2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-stone-600 shadow-md"
              >
                ✕
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-1.5 py-3">
              {shots.map((s) => (
                <div
                  key={s.id}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    s.id === selectedShot.id ? "bg-amber-400" : "bg-stone-300"
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-[family-name:var(--font-heading)] text-stone-500 font-semibold">
                  Shot {selectedShot.sequenceNumber} of {shots.length}
                </span>
                <span className="text-stone-400 text-sm">
                  {selectedShot.durationSeconds}s
                </span>
              </div>

              {/* Character tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedShot.characters.map((sc) => (
                  <span
                    key={sc.characterId}
                    className="text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium"
                  >
                    {sc.character.name}
                  </span>
                ))}
              </div>

              {/* Editable description */}
              <label className="font-[family-name:var(--font-heading)] text-sm font-semibold text-stone-600 block mb-2">
                Change what happens in this shot:
              </label>
              <textarea
                value={editingDescription}
                onChange={(e) => setEditingDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-400 focus:outline-none text-lg mb-4"
              />

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={saveDescription}
                  disabled={
                    isSaving ||
                    editingDescription === selectedShot.kidDescription
                  }
                  className="flex-1 font-[family-name:var(--font-heading)] py-3 bg-amber-400 hover:bg-amber-500 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl font-semibold transition-colors"
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
                {selectedShot.videoUrl && selectedShot.reshootsRemaining > 0 && (
                  <button
                    onClick={() => reshootShot(selectedShot.id)}
                    className="font-[family-name:var(--font-heading)] py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors"
                  >
                    🎬 Reshoot! ({selectedShot.reshootsRemaining} left)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
