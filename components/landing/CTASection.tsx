import Link from "next/link";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="bg-zinc-950 px-6 py-24">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 px-8 py-16 text-center">
          <div aria-hidden className="absolute inset-0 bg-dot-grid text-white/[0.06]" />
          <div aria-hidden className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div
            aria-hidden
            className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white mb-5"
          >
            <Trophy className="h-6 w-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4 relative">
            Your next session is one intake away.
          </h2>
          <p className="text-emerald-100 mb-8 max-w-md mx-auto relative">
            A few minutes of questions. A 3-week program built around you on the other side.
          </p>
          <Link href="/#pricing" className="relative inline-block">
            <Button variant="inverse" className="text-base px-6 py-3">
              Start Free for 7 Days
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
