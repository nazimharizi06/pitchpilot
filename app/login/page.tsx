"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/landing/Header";
import { Field, inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Check <strong>{email}</strong> for a sign-in link.
      </p>
    );
  }

  return (
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
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Sending..." : "Send sign-in link"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="max-w-sm mx-auto px-6 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Log in</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          No password — we&apos;ll email you a sign-in link.
        </p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>
    </>
  );
}
