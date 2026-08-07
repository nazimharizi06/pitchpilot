"use client";

import Link from "next/link";
import { useState } from "react";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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

// Shown when "See My Plan" is clicked while signed out — the plan already
// exists (server-side, pending_plans), this is just the one small step to
// attach it to a real account. Google sign-in returns straight back here
// (redirectTo next=/intake), where /intake auto-claims the pending plan on
// mount and redirects to /plan — no second click, no re-generation.
export function SaveYourPlanPrompt({ onError }: { onError: (message: string) => void }) {
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/intake")}` },
    });
    if (error) {
      onError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="px-6 py-16 max-w-sm mx-auto text-center">
      <div className="h-14 w-14 rounded-2xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center mx-auto mb-6">
        <Lock className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-semibold text-white mb-2">Save your plan</h1>
      <p className="text-sm text-zinc-400 mb-8">
        Sign in to see your personalized training program and keep your progress.
      </p>
      <div className="flex flex-col gap-3">
        <Button variant="outlineDark" className="w-full gap-2" onClick={handleGoogle} disabled={loading}>
          <GoogleIcon />
          {loading ? "Redirecting..." : "Continue with Google"}
        </Button>
        <Link href="/login?next=/intake">
          <Button variant="outlineDark" className="w-full border-transparent text-zinc-400 hover:text-white hover:bg-transparent">
            Sign in with email
          </Button>
        </Link>
      </div>
    </div>
  );
}
