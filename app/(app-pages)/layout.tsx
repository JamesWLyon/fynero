import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "../ui/NavBar";
import { BackgroundWrapper } from "../ui/Wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fynero",
  description: "Made by James Lyon",
};

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <Navbar />

      <main className="flex-1 min-w-0">
        <BackgroundWrapper variant="secondary" />

        {/* pt-16 on mobile gives room for the hamburger button, removed on md+ */}
        <div className="relative p-6 pt-16 md:pt-6 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}