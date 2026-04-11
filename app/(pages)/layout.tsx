import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "../ui/NavBar";
import StarField from "../ui/StarField";
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

const stars = Array.from({ length: 80 });

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <Navbar />

      <main className="flex-1">
        <BackgroundWrapper className="bg-[linear-gradient(to_right,var(--fifth-clr),var(--fourth-clr))]" />

        {/* Content */}
        <div className="p-6 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
