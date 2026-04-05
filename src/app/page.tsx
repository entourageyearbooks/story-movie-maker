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

      <section className="relative z-10 mb-12 max-w-2xl w-full p-8 md:p-10 text-stone-900 text-lg md:text-xl leading-relaxed space-y-5 [text-shadow:0_1px_3px_rgba(255,251,235,0.9)]">
        <p>
          Imagine your child draws a picture of a brave cat named Luna. They tell you all about how Luna saved the village from a shadow wolf. Now imagine that story — with their drawing — becoming an actual animated movie they directed themselves.
        </p>
        <p className="font-semibold text-stone-800">
          That&apos;s what this app does. Here&apos;s how it works:
        </p>
        <p>
          Your child picks the kind of movie they want to make. A rescue mission, a monster battle, a space adventure — we have a handful of story types to choose from, each one designed to make a great short film.
        </p>
        <p>
          Then they fill in the fun details. Who&apos;s the hero? What&apos;s the villain&apos;s name? Where does the story happen? How does it end? They can upload their own drawings or photos to be used as the characters in the movie. A crayon sketch of a dragon? That becomes their dragon.
        </p>
        <p>
          The app takes all of that and creates a storyboard — a visual plan showing every scene in the movie, laid out like cards on a director&apos;s corkboard. Your child can read what happens in each scene, see a preview image, and change anything they want. &ldquo;Actually, the dragon should breathe ice, not fire.&rdquo; Done.
        </p>
        <p>
          When they&apos;re happy with the plan, they hit the big button: &ldquo;Film my movie!&rdquo; The AI generates each scene as a short video clip — usually takes a few minutes — and stitches them all together into a finished 60–90 second animated short film.
        </p>
        <p>
          They watch it. If a scene doesn&apos;t look right, they can reshoot just that one scene, like a real director calling for another take. When it&apos;s perfect, they download it, share it, watch it a hundred times.
        </p>
        <p>
          The whole thing takes about 15–20 minutes from idea to finished movie. No animation skills needed. No complicated software. Just their imagination, their drawings, and a big &ldquo;Film my movie!&rdquo; button.
        </p>
        <div className="text-center pt-4">
          <a href="#stories" className="inline-block bg-amber-400 hover:bg-amber-500 transition-colors text-stone-900 font-bold text-xl md:text-2xl px-10 py-4 rounded-full shadow-lg hover:shadow-xl font-[family-name:var(--font-heading)]">
            Start now!
          </a>
        </div>
      </section>

      <h2 id="stories" className="relative z-10 font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-semibold text-stone-700 mb-8">
        What kind of movie do you want to make?
      </h2>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
        {storyTemplates.map((template) => (
          <Link
            key={template.id}
            href={`/create/${template.id}`}
            className="group relative flex flex-col rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border-2 border-stone-200 hover:border-amber-400 overflow-hidden h-72"
          >
            <Image
              src={template.icon}
              alt={template.title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <div className="relative z-10 flex-1 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
              <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-white mb-1 drop-shadow-lg">
                {template.title}
              </h3>
              <p className="text-white/90 text-sm drop-shadow-md">{template.hook}</p>
            </div>
            <div className="relative z-10 bg-amber-100/90 group-hover:bg-amber-200/90 transition-colors px-8 py-3 text-center">
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
