import { Title } from "../ui/Titles";
import Card from "../ui/Card";
import { BackgroundWrapper, AuthPageWrapper } from "../ui/Wrapper";
import Button from "./Button";
import Link from "next/dist/client/link";

export default function AuthForm({ formType }: { formType?: string }) {

    const displayType = formType === "login" ? "Login" : "Sign Up";
    return (
        <AuthPageWrapper>
            <BackgroundWrapper className="bg-[radial-gradient(circle_at_center,var(--color-fourth)_0%,var(--color-third)_85%,#05080e_100%)]" />
                <Card className="max-w-[500px]">
                    <Title title={displayType} />
                    
                    <input type="email" placeholder="Email" required className="w-full p-3 mt-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input type="password" placeholder="Password" required className="w-full p-3 mt-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" />

                    {formType !== "login" && (
                        <input type="password" placeholder="Confirm Password" required className="w-full p-3 mt-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" />
                    )}

                    {/* Conformation Button */}
                    <Button variant="authButton">
                        {displayType}
                    </Button>

                    {formType === "login" ? (
                        <p className="text-sm text-secondary mt-4">
                            Don't have an account?{' '}
                            <Link href="/sign-up" className="text-sixth hover:underline">
                                Sign up
                            </Link>
                        </p>
                    ) : (
                        <p className="text-sm text-secondary mt-4">
                            Already have an account?{' '}
                            <Link href="/login" className="text-sixth hover:underline">
                                Log in
                            </Link>
                        </p>
                    )}

                </Card>
        </AuthPageWrapper>
    );
}