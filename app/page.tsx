import Image from "next/image";
import Link from "next/link";
import Title from "./ui/Title";

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col gap-4 items-center justify-center text-center">
            <Title title="Fynero" className="text-8xl tracking-tight text-shadow-lg text-shadow-slate-500" />
            <p className="text-lg text-secondary max-w-xs">
                <span className="text-3xl">Track. Budget. Grow.</span>
                <br />
                Take control of your money and build a future you're proud of.
            </p>
            <Link href="/dashboard" className="
                mt-4
                px-6 py-3
                rounded-full
                bg-gradient-to-r from-blue-500 to-blue-300
                text-third
                font-medium
                shadow-lg
                hover:scale-105
                transition
                hover:cursor-pointer
            ">
                Lets start this journey →
            </Link>
        </div>
    );
}