import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { UserMenu } from "@/components/auth/UserMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50">
          <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
            P
          </span>
          PitchPilot
        </Link>
        <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <a href="#how-it-works" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            How it works
          </a>
          <a href="#goals" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Training areas
          </a>
          <Link href="/drills" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Drill library
          </Link>
          <a href="#pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Pricing
          </a>
          <a href="#faq" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <UserMenu />
          <Link href="/intake">
            <Button className="text-sm px-4 py-2">Start free trial</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
