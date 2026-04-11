import { Star } from "lucide-react";
import StarField from "./StarField";

export default function Wrapper({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <section className={`w-full ${className || ''}`}>
            {children}
        </section>
    );
}

export function BackgroundWrapper({ className }: { className?: string }) {
    return (
        <div className={`fixed inset-0 -z-10`}>
            <div className={`absolute inset-0 ${className || ''}`} />
            <StarField />
        </div>
    );
}

export function AuthPageWrapper({ children }: { children: React.ReactNode }) {
    return (
        <Wrapper className="min-h-screen flex flex-col gap-4 items-center justify-center text-center">
            {children}
        </Wrapper>
    );
}