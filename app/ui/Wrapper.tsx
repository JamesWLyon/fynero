import StarField from "./StarField";
import { backgroundVariants, BackgroundVariant } from "../config/backgrounds";

type BackgroundName = keyof typeof backgroundVariants;

export default function Wrapper({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <section className={`w-full max-w-full overflow-x-hidden ${className || ''}`}>
            {children}
        </section>
    );
}

export function BackgroundWrapper({ className, variant }: { className?: string; variant: BackgroundVariant }) {
    return (
        <div className={`fixed inset-0 -z-10`}>
            <div className={`absolute inset-0 ${backgroundVariants[variant]} ${className || ''}`} />
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