"use client";

import { Title } from "../ui/Titles";
import Card from "../ui/Card";
import { BackgroundWrapper, AuthPageWrapper } from "../ui/Wrapper";
import Button from "./Button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthForm({ formType }: { formType?: string }) {

    const isLogin = formType === "login";
    const displayType = isLogin ? "Login" : "Sign Up";
    const router = useRouter();


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const email = String(formData.get("email") || "");
        const password = String(formData.get("password") || "");
        const confirmPassword = String(formData.get("confirmPassword") || "");

        if (!isLogin && password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        const supabase = createClient();

        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                alert(error.message);
                return;
            }

            router.push("/dashboard");
            router.refresh();
        } else {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                alert(error.message);
                return;
            }

            alert("Check your email to confirm your account.");
            router.push("/login");
        }
    }

    return (
        <AuthPageWrapper>
            <BackgroundWrapper className="bg-[radial-gradient(circle_at_center,var(--color-fourth)_0%,var(--color-third)_85%,#05080e_100%)]" />
                <Card className="max-w-[500px]">
                    <Title title={displayType} />
                    
                    <form onSubmit={handleSubmit}>
                        <input
                            name="email"
                            type="email" 
                            placeholder="Email" 
                            required 
                            className="w-full p-3 mt-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" />
                        <input
                            name="password"
                            type="password" 
                            placeholder="Password" 
                            required 
                            className="w-full p-3 mt-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" />

                        {formType !== "login" && (
                            <input
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm Password"
                                required
                                className="w-full p-3 mt-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" />
                        )}

                        {/* Conformation Button */}
                        <Button type="submit" variant="authButton">
                            {displayType}
                        </Button>
                    </form>

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