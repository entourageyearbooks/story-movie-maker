"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavHeader() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/my-movies", label: "My Movies" },
  ];

  return (
    <header className="bg-white border-b-2 border-stone-200 shadow-sm">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] text-xl font-bold text-stone-800 hover:text-amber-600 transition-colors"
        >
          Story Movie Maker
        </Link>
        <div className="flex items-center gap-6">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-[family-name:var(--font-heading)] text-base font-semibold transition-colors pb-0.5 ${
                  isActive
                    ? "text-amber-600 border-b-2 border-amber-400"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
