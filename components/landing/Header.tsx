import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { UserMenu } from "@/components/auth/UserMenu";

// `dark` forces the always-dark styling used on the marketing homepage,
// independent of the visitor's OS color-scheme — the app pages (intake,
// plan, drills, login) keep the default adaptive light/dark look.
export function Header({ dark = false }: { dark?: boolean }) {
  return (
    <header
      className={
        dark
          ? "sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md"
          : "sticky top-0 z-50 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-black/80 backdrop-blur-md"
      }
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className={`flex items-center gap-2 font-semibold ${dark ? "text-white" : "text-zinc-900 dark:text-zinc-50"}`}>
          <Image src="/brand/pitchpilot-icon.png" alt="" width={28} height={28} className="rounded-lg" />
          PitchPilot
        </Link>
        <nav className={`hidden sm:flex items-center gap-8 text-sm font-medium ${dark ? "text-zinc-400" : "text-zinc-600 dark:text-zinc-400"}`}>
          <a href="#how-it-works" className={dark ? "hover:text-white transition-colors" : "hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"}>
            How it works
          </a>
          <a href="#goals" className={dark ? "hover:text-white transition-colors" : "hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"}>
            Training areas
          </a>
          <Link href="/drills" className={dark ? "hover:text-white transition-colors" : "hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"}>
            Drill library
          </Link>
          <a href="#pricing" className={dark ? "hover:text-white transition-colors" : "hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"}>
            Pricing
          </a>
          <a href="#faq" className={dark ? "hover:text-white transition-colors" : "hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"}>
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <UserMenu dark={dark} />
          <Link href="/intake">
            <Button className="text-sm px-4 py-2">Start Free</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
