"use client";

import { Title } from "../ui/Titles";
import Card from "../ui/Card";
import { BackgroundWrapper, AuthPageWrapper } from "../ui/Wrapper";
import Button from "./Button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthForm({ formType }: { formType?: string }) {

    const isLogin = formType === "login";
    const displayType = isLogin ? "Login" : "Sign Up";
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
            
    const config = {
        login: { 
            title: "Login",
            showEmail: true,         
            showPassword: true,  
            showConfirmPassword: false, 
            showForgot: true,  
            submitLabel: "Login",           
            switchText: "Don't have an account?",  
            switchLabel: "Sign up",  
            switchHref: "/sign-up" 
        }, signup: { 
            title: "Sign Up",
            showEmail: true,         
            showPassword: true,  
            showConfirmPassword: true,  
            showForgot: false, 
            submitLabel: "Sign Up",         
            switchText: "Already have an account?", 
            switchLabel: "Log in",   
            switchHref: "/login"   
        }, forgotPassword: { 
            title: "Forgot Password", 
            showEmail: true,         
            showPassword: false, 
            showConfirmPassword: false, 
            showForgot: false, 
            submitLabel: "Send Reset Email", 
            switchText: "Remembered it?",          
            switchLabel: "Log in",   
            switchHref: "/login"   
        }, resetPassword: {
            title: "Reset Password",
            showEmail: false, 
            showPassword: true,
            showConfirmPassword: true,
            showForgot: false,
            submitLabel: "Reset Password",
            switchText: "Remembered it?",
            switchLabel: "Log in",
            switchHref: "/login"
        }
    } as const;

    const { title, showEmail, showPassword, showConfirmPassword, showForgot, submitLabel, switchText, switchLabel, switchHref } = config[formType as keyof typeof config] ?? config.login;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    const supabase = createClient();

    if (formType === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setError(error.message); return; }
        router.push("/dashboard");
        router.refresh();

    } else if (formType === "signup") {
        if (password !== confirmPassword) { setError("Passwords do not match."); return; }
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) { setError(error.message); return; }
        if (data.user && data.user.identities && data.user.identities.length === 0) {
            setError("An account with this email already exists.");
            return;
        }
        setShowConfirm(true);

    } else if (formType === "forgotPassword") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `https://fynero.vercel.app/reset-password`,
        });

        if (error) { 
            setError(error.message); 
            return; 
        }

        setError("Check your email for a reset link.");
    } else if (formType === "resetPassword") {
        if (password !== confirmPassword) { setError("Passwords do not match."); return; }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) { setError(error.message); return; }
        router.push("/login");
    }
}

return (
    <AuthPageWrapper>
        {/* Confirmation Window For Signup */}
        {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="bg-white rounded-xl p-8 max-w-sm w-full text-center shadow-xl">
                    <p className="text-lg font-semibold text-gray-800">Check your email to confirm your account.</p>
                    <button
                        onClick={() => { setShowConfirm(false); router.push("/login"); }}
                        className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition">
                        Go to Login
                    </button>
                </div>
            </div>
        )}

        <BackgroundWrapper variant="primary" />
            <Card className="max-w-[500px]">
                <Title title={title} />
                {error && <p className="text-md font-bold mt-2 text-red-500">{error}</p>}

                <form onSubmit={handleSubmit}>
                    {showEmail && (
                        <input name="email" type="email" placeholder="Email" required
                            className="w-full p-3 mt-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" />
                    )}

                    {showPassword && (
                        <input name="password" type="password" placeholder="Password" required
                            className="w-full p-3 mt-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" />
                    )}

                    {showConfirmPassword && (
                        <input name="confirmPassword" type="password" placeholder="Confirm Password" required
                            className="w-full p-3 mt-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" />
                    )}

                    {showForgot && (
                        <Link href="/forgot-password" className="text-md text-secondary hover:underline mt-2 block text-left">
                            Forgot your password?
                        </Link>
                    )}

                    <Button type="submit" variant="authButton">{submitLabel}</Button>
                </form>

                <p className="text-md text-secondary mt-4">
                    {switchText}{' '}
                    <Link href={switchHref} className="text-sixth hover:underline">{switchLabel}</Link>
                </p>
            </Card>
        </AuthPageWrapper>
    );
}