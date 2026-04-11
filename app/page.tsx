import Image from "next/image";
import Link from "next/link";
import { Title, SubTitle } from "@/app/ui/Titles";
import { BackgroundWrapper, AuthPageWrapper } from "./ui/Wrapper";
import Button from "./ui/Button";
import Icon from "./ui/Icon";

export default function LandingPage() {
    return (
        <AuthPageWrapper>
            <BackgroundWrapper className="bg-[radial-gradient(circle_at_center,var(--color-fourth)_0%,var(--color-third)_85%,#05080e_100%)]" />
            
            <Title title="Fynero" className="text-8xl tracking-tight text-shadow-lg text-shadow-black-500" />
            <p className="text-lg text-secondary max-w-xs">
                <span className="text-3xl">Track. Budget. Grow.</span>
                <br />
                Take control of your money and build a future you're proud of.
            </p>
            <Button variant="authButton">
                <Link href="/login" className="flex items-center gap-2">
                    Lets start this journey 
                    <Icon name="moveRight" />
                </Link>
            </Button>
        </AuthPageWrapper>
    );
}