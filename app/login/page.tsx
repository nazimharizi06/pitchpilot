"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/landing/Header";
import { Field, inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const POLL_INTERVAL_MS = 2500;

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setExpired(false);
    setSubmitting(true);

    // Best-effort: lets this tab auto-continue if the link ends up getting
    // clicked on a different device (e.g. the email is opened on a phone).
    // Sign-in itself still works below even if this fails.
    let createdTicket: string | null = null;
    try {
      const res = await fetch("/api/login-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const body = (await res.json()) as { ticket: string };
        createdTicket = body.ticket;
      }
    } catch {
      // Ignore — proceed without cross-device handoff.
    }

    const redirectUrl = new URL("/auth/callback", window.location.origin);
    redirectUrl.searchParams.set("next", next);
    if (createdTicket) redirectUrl.searchParams.set("ticket", createdTicket);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl.toString() },
    });

    setSubmitting(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    setTicket(createdTicket);
    setSent(true);
  }

  useEffect(() => {
    if (!sent || !ticket || expired) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/login-ticket/status?ticket=${ticket}`);
        const body = (await res.json()) as { status?: "pending" | "expired" | "completed" };
        if (body.status === "completed") {
          clearInterval(interval);
          window.location.assign(next);
        } else if (body.status === "expired") {
          clearInterval(interval);
          setExpired(true);
        }
      } catch {
        // Transient network error — just try again on the next tick.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [sent, ticket, expired, next]);

  if (sent) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Check <strong>{email}</strong> for a sign-in link. Opening it on any device — including your phone —
          will sign in this tab too.
        </p>
        {expired && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            That link has expired.{" "}
            <button
              type="button"
              className="underline"
              onClick={() => {
                setSent(false);
                setTicket(null);
                setExpired(false);
              }}
            >
              Try again
            </button>
          </p>
        )}
      </div>
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
