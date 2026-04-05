"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { storyTemplates, stylePresets } from "@/lib/story-templates";
import type { StylePreset, TemplateQuestion } from "@/lib/story-templates";
import { ProcessingModal } from "@/components/processing-modal";

export default function CreateStoryPage() {
  const params = useParams();
  const router = useRouter();
  const storyType = params.storyType as string;
  const template = storyTemplates.find((t) => t.id === storyType);

  const [step, setStep] = useState<"style" | "questions" | "narration">(
    "style"
  );
  const [selectedStyle, setSelectedStyle] = useState<StylePreset | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<Record<string, File>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>(
    {}
  );
  const [narrationEnabled, setNarrationEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdMovieId, setCreatedMovieId] = useState<string | null>(null);

  if (!template) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-xl text-stone-600">Story type not found.</p>
      </main>
    );
  }

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleImageUpload = (questionId: string, file: File) => {
    setImageFiles((prev) => ({ ...prev, [questionId]: file }));
    const url = URL.createObjectURL(file);
    setImagePreviews((prev) => ({ ...prev, [questionId]: url }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyType,
          stylePreset: selectedStyle,
          answers,
          narrationEnabled,
        }),
      });

      if (!res.ok) throw new Error("Failed to create movie");

      const { movieId } = await res.json();
      setCreatedMovieId(movieId);

      // Trigger screenplay generation via the worker server (port 9091)
      // This runs in a separate process so it doesn't block the main server
      fetch(`http://localhost:9091/generate/${movieId}`, { method: "POST" })
        .then((genRes) => {
          if (genRes.ok) console.log("Screenplay generation started");
          else console.error("Worker server returned error");
        })
        .catch((err) => console.error("Worker server unavailable:", err));

      // Poll for completion, then redirect to storyboard
      const pollForCompletion = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/movies/${movieId}/progress`);
          const data = await statusRes.json();
          if (data.status === "planning" || data.status === "complete") {
            clearInterval(pollForCompletion);
            router.push(`/storyboard/${movieId}`);
          } else if (data.status === "failed") {
            clearInterval(pollForCompletion);
            setIsSubmitting(false);
            setCreatedMovieId(null);
          }
        } catch {
          // ignore polling errors
        }
      }, 2000);
    } catch (error) {
      console.error("Failed to create movie:", error);
      setIsSubmitting(false);
    }
  };

  const currentQuestionIndex = Object.keys(answers).filter((k) => {
    const q = template.questions.find((q) => q.id === k);
    return q && q.type !== "image_upload" && answers[k];
  }).length;

  const requiredQuestions = template.questions.filter(
    (q) => q.required && q.type !== "image_upload"
  );
  const allRequiredAnswered = requiredQuestions.every((q) => answers[q.id]);

  if (isSubmitting) {
    return <ProcessingModal movieId={createdMovieId || undefined} />;
  }

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Image src={template.icon} alt={template.title} width={120} height={120} className="mx-auto mb-2 rounded-xl" />
          <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-stone-800">
            {template.title}
          </h1>
          <p className="text-stone-600 mt-2">{template.hook}</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["style", "questions", "narration"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-[family-name:var(--font-heading)] font-bold text-lg transition-colors ${
                  step === s
                    ? "bg-amber-400 text-white"
                    : ["style", "questions", "narration"].indexOf(step) > i
                      ? "bg-amber-200 text-amber-700"
                      : "bg-stone-200 text-stone-400"
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && (
                <div className="w-12 h-1 bg-stone-200 rounded">
                  <div
                    className={`h-full rounded transition-all ${
                      ["style", "questions", "narration"].indexOf(step) > i
                        ? "bg-amber-400 w-full"
                        : "w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Art Style Selection */}
        {step === "style" && (
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-stone-700 mb-6 text-center">
              Pick a style for your movie
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {stylePresets.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    selectedStyle === style.id
                      ? "border-amber-400 bg-amber-50 shadow-md"
                      : "border-stone-200 bg-white hover:border-amber-300"
                  }`}
                >
                  <span className="text-4xl block mb-2">{style.icon}</span>
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg text-stone-800">
                    {style.title}
                  </h3>
                  <p className="text-stone-500 text-sm mt-1">
                    {style.description}
                  </p>
                </button>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setStep("questions")}
                disabled={!selectedStyle}
                className="font-[family-name:var(--font-heading)] text-lg px-8 py-3 bg-amber-400 hover:bg-amber-500 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-full font-semibold transition-colors shadow-md"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Story Questions */}
        {step === "questions" && (
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-stone-700 mb-6 text-center">
              Tell us about your story
            </h2>
            <div className="space-y-6">
              {template.questions.map((question) => (
                <QuestionField
                  key={question.id}
                  question={question}
                  value={answers[question.id] || ""}
                  imagePreview={imagePreviews[question.id]}
                  onChange={(val) => handleAnswer(question.id, val)}
                  onImageUpload={(file) =>
                    handleImageUpload(question.id, file)
                  }
                />
              ))}
            </div>
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep("style")}
                className="font-[family-name:var(--font-heading)] text-lg px-6 py-3 text-stone-600 hover:text-stone-800 font-semibold"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep("narration")}
                disabled={!allRequiredAnswered}
                className="font-[family-name:var(--font-heading)] text-lg px-8 py-3 bg-amber-400 hover:bg-amber-500 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-full font-semibold transition-colors shadow-md"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Narration Option */}
        {step === "narration" && (
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-stone-700 mb-6 text-center">
              One more thing...
            </h2>
            <div className="bg-white rounded-2xl border-2 border-stone-200 p-8 mb-8">
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-stone-800 mb-2">
                Add a narrator to your movie?
              </h3>
              <p className="text-stone-600 mb-6">
                A narrator will introduce your story at the beginning, like in a
                real movie. &quot;Once upon a time...&quot;
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setNarrationEnabled(true)}
                  className={`flex-1 py-4 rounded-xl border-2 font-[family-name:var(--font-heading)] font-semibold text-lg transition-all ${
                    narrationEnabled
                      ? "border-amber-400 bg-amber-50 text-amber-800"
                      : "border-stone-200 text-stone-600 hover:border-amber-300"
                  }`}
                >
                  🎙️ Yes, add narration!
                </button>
                <button
                  onClick={() => setNarrationEnabled(false)}
                  className={`flex-1 py-4 rounded-xl border-2 font-[family-name:var(--font-heading)] font-semibold text-lg transition-all ${
                    !narrationEnabled
                      ? "border-amber-400 bg-amber-50 text-amber-800"
                      : "border-stone-200 text-stone-600 hover:border-amber-300"
                  }`}
                >
                  🎬 No thanks, just visuals
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep("questions")}
                className="font-[family-name:var(--font-heading)] text-lg px-6 py-3 text-stone-600 hover:text-stone-800 font-semibold"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="font-[family-name:var(--font-heading)] text-lg px-8 py-4 bg-green-500 hover:bg-green-600 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-full font-bold transition-colors shadow-lg"
              >
                {isSubmitting ? "Creating your movie..." : "🎬 Create my movie!"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function QuestionField({
  question,
  value,
  imagePreview,
  onChange,
  onImageUpload,
}: {
  question: TemplateQuestion;
  value: string;
  imagePreview?: string;
  onChange: (value: string) => void;
  onImageUpload: (file: File) => void;
}) {
  if (question.type === "image_upload") {
    return (
      <div className="bg-white rounded-xl border-2 border-stone-200 p-6">
        <label className="font-[family-name:var(--font-heading)] font-semibold text-stone-800 block mb-1">
          {question.label}
        </label>
        {question.helperText && (
          <p className="text-stone-500 text-sm mb-3">{question.helperText}</p>
        )}
        <div className="flex items-center gap-4">
          <label className="cursor-pointer flex-1">
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                imagePreview
                  ? "border-amber-400 bg-amber-50"
                  : "border-stone-300 hover:border-amber-400 hover:bg-amber-50"
              }`}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-32 mx-auto rounded-lg"
                />
              ) : (
                <div>
                  <span className="text-3xl block mb-2">🖼️</span>
                  <span className="text-stone-500">
                    Tap to upload a drawing or photo
                  </span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImageUpload(file);
              }}
            />
          </label>
        </div>
      </div>
    );
  }

  if (question.type === "select" && question.options) {
    return (
      <div className="bg-white rounded-xl border-2 border-stone-200 p-6">
        <label className="font-[family-name:var(--font-heading)] font-semibold text-stone-800 block mb-3">
          {question.label}
          {question.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <div className="grid grid-cols-1 gap-2">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                value === option.value
                  ? "border-amber-400 bg-amber-50 text-amber-800"
                  : "border-stone-200 hover:border-amber-300 text-stone-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-stone-200 p-6">
      <label className="font-[family-name:var(--font-heading)] font-semibold text-stone-800 block mb-1">
        {question.label}
        {question.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {question.helperText && (
        <p className="text-stone-500 text-sm mb-3">{question.helperText}</p>
      )}
      {question.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-400 focus:outline-none text-lg"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-400 focus:outline-none text-lg"
        />
      )}
    </div>
  );
}
