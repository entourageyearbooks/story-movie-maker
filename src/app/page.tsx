import Link from "next/link";
import Image from "next/image";
import { storyTemplates } from "@/lib/story-templates";

export default function Home() {
  return (
    <main className="relative flex-1 flex flex-col items-center justify-center px-4 py-12">
      <Image
        src="/images/hero.png"
        alt="Magical tales on a storyteller's desk"
        fill
        className="object-cover opacity-30"
        priority
      />
      <div className="relative z-10 text-center mb-12">
        <h1 className="font-[family-name:var(--font-heading)] text-5xl md:text-6xl font-bold text-stone-800 mb-4">
          Story Movie Maker
        </h1>
        <p className="font-[family-name:var(--font-handwritten)] text-2xl md:text-3xl text-stone-600">
          Turn your stories into real movies!
        </p>
      </div>

      <h2 className="relative z-10 font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-semibold text-stone-700 mb-8">
        What kind of movie do you want to make?
      </h2>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
        {storyTemplates.map((template) => (
          <Link
            key={template.id}
            href={`/create/${template.id}`}
            className="group flex flex-col bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border-2 border-stone-200 hover:border-amber-400 overflow-hidden"
          >
            <div className="flex-1 p-8 text-center">
              <span className="text-6xl block mb-4">{template.icon}</span>
              <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-stone-800 mb-2">
                {template.title}
              </h3>
              <p className="text-stone-600 text-lg">{template.hook}</p>
            </div>
            <div className="bg-amber-100 group-hover:bg-amber-200 transition-colors px-8 py-3 text-center">
              <span className="font-[family-name:var(--font-heading)] text-amber-800 font-semibold">
                Make this movie →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <p className="relative z-10 mt-12 text-stone-400 text-sm">
        More story types coming soon!
      </p>
    </main>
  );
}
