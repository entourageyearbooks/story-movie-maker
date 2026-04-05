import type { Metadata } from "next";
import { Comfortaa, Caveat } from "next/font/google";
import { NavHeader } from "@/components/nav-header";
import "./globals.css";

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Story Movie Maker",
  description: "Turn your stories and drawings into real movies!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${comfortaa.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-amber-50">
        <NavHeader />
        {children}
      </body>
    </html>
  );
}
