import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function DashboardHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
            P
          </span>
          PitchPilot
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="/plan" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/#goals" className="hover:text-white transition-colors">
            Training areas
          </Link>
          <Link href="/drills" className="hover:text-white transition-colors">
            Drill library
          </Link>
          <Link href="/#pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/#faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-zinc-400 truncate max-w-[12rem]">{user?.email}</span>
          <div className="h-8 w-8 rounded-full bg-emerald-600 text-white text-sm font-semibold flex items-center justify-center shrink-0">
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
