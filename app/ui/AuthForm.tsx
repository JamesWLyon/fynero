"use client";

import { Title } from "../ui/Titles";
import Card from "../ui/Card";
import { BackgroundWrapper, AuthPageWrapper } from "../ui/Wrapper";
import Button from "./Button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { resolveUsernameToEmail, isUsernameAvailable } from "@/lib/supabase/profiles";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

// Username availability indicator
type AvailabilityStatus = "idle" | "checking" | "available" | "taken" | "invalid";

function UsernameStatus({ status }: { status: AvailabilityStatus }) {
  if (status === "idle") return null;

  const map: Record<AvailabilityStatus, { text: string; className: string }> = {
    idle:      { text: "",                              className: "" },
    checking:  { text: "Checking...",                  className: "text-gray-400" },
    available: { text: "✓ Username available",         className: "text-green-600" },
    taken:     { text: "✗ Username already taken",     className: "text-red-500" },
    invalid:   { text: "3–30 chars, letters/numbers/_", className: "text-gray-400" },
  };

  const { text, className } = map[status];
  return <p className={`text-sm mt-1 font-medium ${className}`}>{text}</p>;
}

// Main component
export default function AuthForm({ formType }: { formType?: string }) {
  const isLogin = formType === "login";
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<AvailabilityStatus>("idle");
  const [username, setUsername] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config = {
    login: {
      title: "Login",
      showIdentifier: true, // email OR username field
      showEmail: false,
      showUsername: false,
      showPassword: true,
      showConfirmPassword: false,
      showForgot: true,
      submitLabel: "Login",
      switchText: "Don't have an account?",
      switchLabel: "Sign up",
      switchHref: "/sign-up",
    },
    signup: {
      title: "Sign Up",
      showIdentifier: false,
      showEmail: true,
      showUsername: true,
      showPassword: true,
      showConfirmPassword: true,
      showForgot: false,
      submitLabel: "Sign Up",
      switchText: "Already have an account?",
      switchLabel: "Log in",
      switchHref: "/login",
    },
    forgotPassword: {
      title: "Forgot Password",
      showIdentifier: false,
      showEmail: true,
      showUsername: false,
      showPassword: false,
      showConfirmPassword: false,
      showForgot: false,
      submitLabel: "Send Reset Email",
      switchText: "Remembered it?",
      switchLabel: "Log in",
      switchHref: "/login",
    },
    resetPassword: {
      title: "Reset Password",
      showIdentifier: false,
      showEmail: false,
      showUsername: false,
      showPassword: true,
      showConfirmPassword: true,
      showForgot: false,
      submitLabel: "Reset Password",
      switchText: "Remembered it?",
      switchLabel: "Log in",
      switchHref: "/login",
    },
  } as const;

  const cfg =
    config[formType as keyof typeof config] ?? config.login;

  // Username availability: debounced check
  useEffect(() => {
    if (!username) {
      setUsernameStatus("idle");
      return;
    }

    const isValidFormat = /^[a-zA-Z0-9_]{3,30}$/.test(username);
    if (!isValidFormat) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("checking");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const available = await isUsernameAvailable(username);
      setUsernameStatus(available ? "available" : "taken");
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username]);

  // Form submit
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const identifier    = String(formData.get("identifier")     || "");
    const email         = String(formData.get("email")          || "");
    const password      = String(formData.get("password")       || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    const supabase = createClient();

    // Login
    if (formType === "login") {
      // Detect if identifier is an email or username
      const isEmail = identifier.includes("@");
      let resolvedEmail = identifier;

      if (!isEmail) {
        // Resolve username → email
        const found = await resolveUsernameToEmail(identifier);
        if (!found) {
          setError("No account found with that username.");
          return;
        }
        resolvedEmail = found;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      });

      if (error) { setError(error.message); return; }
      router.push("/dashboard");
      router.refresh();

    // Sign up
    } else if (formType === "signup") {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (usernameStatus !== "available") {
        setError("Please choose a valid, available username.");
        return;
      }

      // Pass username in metadata — the DB trigger picks it up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error) { setError(error.message); return; }

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError("An account with this email already exists.");
        return;
      }

      setShowConfirm(true);

    // Forgot password
    } else if (formType === "forgotPassword") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://fynero.vercel.app/reset-password",
      });

      if (error) { setError(error.message); return; }
      setError("Check your email for a reset link.");

    // Reset password
    } else if (formType === "resetPassword") {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) { setError(error.message); return; }
      router.push("/login");
    }
  }

  return (
    <AuthPageWrapper>
      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full text-center shadow-xl">
            <p className="text-lg font-semibold text-gray-800">
              Check your email to confirm your account.
            </p>
            <button
              onClick={() => {
                setShowConfirm(false);
                router.push("/login");
              }}
              className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      <BackgroundWrapper variant="primary" />
      <Card className="max-w-[500px]">
        <Title title={cfg.title} />
        {error && (
          <p className="text-md font-bold mt-2 text-alert">{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          {/* Login: single email-or-username field */}
          {cfg.showIdentifier && (
            <input
              name="identifier"
              type="text"
              placeholder="Email or username"
              required
              autoComplete="username"
              className="w-full p-3 mt-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}

          {/* Sign Up: separate email field */}
          {cfg.showEmail && (
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full p-3 mt-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}

          {/* Sign Up: username field with live availability */}
          {cfg.showUsername && (
            <div className="mt-4">
              <input
                name="username"
                type="text"
                placeholder="Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                  usernameStatus === "available"
                    ? "border-green-400"
                    : usernameStatus === "taken" || usernameStatus === "invalid"
                    ? "border-red-400"
                    : "border-gray-300"
                }`}
              />
              <UsernameStatus status={usernameStatus} />
            </div>
          )}

          {cfg.showPassword && (
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="w-full p-3 mt-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}

          {cfg.showConfirmPassword && (
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
              autoComplete="new-password"
              className="w-full p-3 mt-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}

          {cfg.showForgot && (
            <Link
              href="/forgot-password"
              className="text-md text-secondary hover:underline mt-2 block text-left"
            >
              Forgot your password?
            </Link>
          )}

          <Button type="submit" variant="authButton">
            {cfg.submitLabel}
          </Button>
        </form>

        <p className="text-md text-secondary mt-4">
          {cfg.switchText}{" "}
          <Link
            href={cfg.switchHref}
            className="text-black font-bold underline hover:text-alert"
          >
            {cfg.switchLabel}
          </Link>
        </p>
      </Card>
    </AuthPageWrapper>
  );
}
