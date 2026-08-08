"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { UserMenu } from "@/components/auth/UserMenu";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#goals", label: "Training areas" },
  { href: "/drills", label: "Drill library" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

// `dark` forces the always-dark styling used on the marketing homepage,
// independent of the visitor's OS color-scheme — the app pages (intake,
// plan, drills, login) keep the default adaptive light/dark look.
//
// Below `lg`, the full link row + account state doesn't fit comfortably
// (5 links + logo + email + CTA), so they move into a collapsible menu —
// logo, a short CTA, and the menu trigger stay visible at every width.
export function Header({ dark = false }: { dark?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const linkClass = dark ? "hover:text-white transition-colors" : "hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors";

  return (
    <header
      className={
        dark
          ? "sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md"
          : "sticky top-0 z-50 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-black/80 backdrop-blur-md"
      }
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className={`flex items-center gap-2 font-semibold shrink-0 ${dark ? "text-white" : "text-zinc-900 dark:text-zinc-50"}`}>
          <Image src="/brand/pitchpilot-icon.png" alt="" width={28} height={28} className="rounded-lg" />
          PitchPilot
        </Link>
        <nav className={`hidden lg:flex items-center gap-8 text-sm font-medium ${dark ? "text-zinc-400" : "text-zinc-600 dark:text-zinc-400"}`}>
          {NAV_LINKS.map((link) =>
            link.href.startsWith("/") ? (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ) : (
              <a key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </a>
            )
          )}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <UserMenu dark={dark} />
          </div>
          <Link href="/intake" onClick={() => track("build_plan_click", { location: "header" })}>
            <Button className="text-sm px-4 py-2 whitespace-nowrap">
              <span className="hidden sm:inline">Build My Free Plan</span>
              <span className="sm:hidden">Build My Plan</span>
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className={`lg:hidden rounded-lg p-2 -mr-2 ${dark ? "text-zinc-300 hover:text-white" : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"}`}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-nav-panel"
          className={
            dark
              ? "lg:hidden border-t border-zinc-800 bg-zinc-950 px-6 py-5"
              : "lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black px-6 py-5"
          }
        >
          <nav className={`flex flex-col gap-4 text-sm font-medium mb-5 ${dark ? "text-zinc-300" : "text-zinc-700 dark:text-zinc-300"}`}>
            {NAV_LINKS.map((link) =>
              link.href.startsWith("/") ? (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className={linkClass}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className={linkClass}>
                  {link.label}
                </a>
              )
            )}
          </nav>
          <div className={`pt-4 border-t ${dark ? "border-zinc-800" : "border-zinc-200 dark:border-zinc-800"}`}>
            <UserMenu dark={dark} />
          </div>
        </div>
      )}
    </header>
  );
}
