"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/landing/Header";
import { Field, inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

// Google's official multicolor "G" mark — lucide-react doesn't ship brand icons.
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.86c2.26-2.09 3.56-5.17 3.56-8.87z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.07.72-2.45 1.14-4.07 1.14-3.13 0-5.78-2.11-6.73-4.96H1.28v3.11A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.11H1.28a12 12 0 0 0 0 10.76z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.11C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function switchMode(nextMode: "signin" | "signup") {
    setMode(nextMode);
    setError(null);
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    const supabase = createClient();

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setSubmitting(false);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      window.location.assign(next);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setMessage("Check your email to confirm your account, then sign in below.");
  }

  async function handleGoogle() {
    setError(null);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (oauthError) setError(oauthError.message);
  }

  return (
    <div className="flex flex-col gap-5">
      <Button variant="secondary" className="w-full gap-2" type="button" onClick={handleGoogle}>
        <GoogleIcon />
        Continue with Google
      </Button>

      <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        or
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Email">
          <input
            type="email"
            required
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            required
            minLength={6}
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {message && <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="text-sm text-center text-zinc-500 dark:text-zinc-400">
        {mode === "signin" ? (
          <>
            Don&apos;t have an account?{" "}
            <button type="button" className="underline text-zinc-900 dark:text-zinc-100" onClick={() => switchMode("signup")}>
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button type="button" className="underline text-zinc-900 dark:text-zinc-100" onClick={() => switchMode("signin")}>
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="max-w-sm mx-auto px-6 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Log in</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">Sign in to manage your plan and subscription.</p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>
    </>
  );
}
