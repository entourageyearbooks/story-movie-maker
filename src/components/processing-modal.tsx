"use client";

import { useState, useEffect, useRef } from "react";

const MESSAGES = [
  { text: "Our AI director is reading your story...", emoji: "📖" },
  { text: "Casting your characters for their big roles...", emoji: "🎭" },
  { text: "Scouting the perfect locations for each scene...", emoji: "🏔️" },
  { text: "Writing the screenplay shot by shot...", emoji: "✍️" },
  { text: "Now is a great time to grab a snack!", emoji: "🍿" },
  { text: "Setting up the cameras and lights...", emoji: "🎥" },
  { text: "Almost there... the director is reviewing the script!", emoji: "🎬" },
];

const STAGE_ICONS: Record<string, string> = {
  setup: "📋",
  prompt: "📝",
  calling: "📡",
  received: "📬",
  parsed: "🎯",
  shot: "🎬",
  titles: "🏷️",
  complete: "✅",
  error: "❌",
};

interface ProgressEntry {
  time: string;
  stage: string;
  message: string;
  detail?: string;
}

interface ProcessingModalProps {
  movieId?: string;
}

export function ProcessingModal({ movieId }: ProcessingModalProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [progressLog, setProgressLog] = useState<ProgressEntry[]>([]);
  const [expandedDetail, setExpandedDetail] = useState<number | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Rotating fun messages
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
        setFade(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Poll for progress if movieId is provided
  useEffect(() => {
    if (!movieId) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/movies/${movieId}/progress`);
        if (res.ok) {
          const data = await res.json();
          setProgressLog(data.log || []);
        }
      } catch {
        // ignore polling errors
      }
    };

    // Poll immediately then every 1.5 seconds
    poll();
    const interval = setInterval(poll, 1500);
    return () => clearInterval(interval);
  }, [movieId]);

  // Auto-scroll log to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [progressLog]);

  const current = MESSAGES[messageIndex];
  const latestStage = progressLog.length > 0 ? progressLog[progressLog.length - 1].stage : null;
  const hasError = latestStage === "error";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center bg-amber-50/95 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl px-6 py-8">
        {/* Animated header */}
        <div className="text-center mb-6">
          <div className="mb-4 relative inline-block">
            <span className="text-6xl inline-block animate-[spin_3s_linear_infinite]">
              🎞️
            </span>
            <span className="absolute -top-2 -right-2 text-2xl inline-block animate-[bounce_1s_ease-in-out_infinite]">
              ✨
            </span>
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-bold text-stone-800 mb-2">
            Creating your movie!
          </h2>
          <p className="text-stone-500 text-sm">
            This can take 2 to 5 minutes.
          </p>
        </div>

        {/* Rotating fun messages */}
        <div className="h-12 flex items-center justify-center mb-6">
          <p
            className={`text-lg font-[family-name:var(--font-handwritten)] text-stone-600 transition-opacity duration-400 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="text-xl mr-2">{current.emoji}</span>
            {current.text}
          </p>
        </div>

        {/* Live progress feed */}
        {movieId && (
          <div className="bg-white rounded-2xl border-2 border-stone-200 shadow-md overflow-hidden">
            <div className="bg-stone-800 px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-stone-400 text-xs font-mono ml-2">
                Director&apos;s Log
              </span>
              {!hasError && progressLog.length > 0 && latestStage !== "complete" && (
                <span className="ml-auto flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs">live</span>
                </span>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto p-4 space-y-2 font-mono text-sm">
              {progressLog.length === 0 ? (
                <div className="text-stone-400 text-center py-4">
                  <span className="animate-pulse">Connecting to the studio...</span>
                </div>
              ) : (
                progressLog.map((entry, i) => (
                  <div key={i}>
                    <div
                      className={`flex items-start gap-2 ${
                        entry.stage === "error" ? "text-red-600" : "text-stone-700"
                      }`}
                    >
                      <span className="text-base flex-shrink-0 mt-0.5">
                        {STAGE_ICONS[entry.stage] || "▶️"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-stone-400 text-xs flex-shrink-0">
                            {entry.time}
                          </span>
                          <span className={entry.stage === "error" ? "text-red-600 font-semibold" : ""}>
                            {entry.message}
                          </span>
                        </div>
                        {entry.detail && (
                          <button
                            onClick={() => setExpandedDetail(expandedDetail === i ? null : i)}
                            className="text-xs text-amber-600 hover:text-amber-700 mt-1 underline"
                          >
                            {expandedDetail === i ? "Hide details" : "Show details"}
                          </button>
                        )}
                        {entry.detail && expandedDetail === i && (
                          <div className="mt-1 text-xs text-stone-500 bg-stone-50 rounded-lg p-2 break-words">
                            {entry.detail}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>
        )}

        {/* Progress bar */}
        {!hasError && latestStage !== "complete" && (
          <div className="mt-6 w-64 mx-auto h-2 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full animate-[progress_2s_ease-in-out_infinite]" />
          </div>
        )}

        {hasError && (
          <div className="mt-6 text-center">
            <p className="text-red-600 font-semibold">
              Something went wrong. Check the log above for details.
            </p>
          </div>
        )}

        <style jsx>{`
          @keyframes progress {
            0% { width: 0%; margin-left: 0%; }
            50% { width: 60%; margin-left: 20%; }
            100% { width: 0%; margin-left: 100%; }
          }
        `}</style>
      </div>
    </div>
  );
}
