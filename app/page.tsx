import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col gap-4 items-center justify-center text-center">
            <h1 className="text-6xl font-bold tracking-tight text-shadow-lg text-shadow-slate-500">Welcome to Fynero</h1>
            <p className="text-lg">
                <span className="text-2xl">Track. Budget. Grow.</span>
                <br />
                Take control of your money and build a future you're proud of.
            </p>
            <Link href="/dashboard" className="
                mt-4
                px-6 py-3
                rounded-full
                bg-gradient-to-r from-blue-500 to-blue-300
                text-black
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