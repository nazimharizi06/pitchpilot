import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 px-8 py-16 text-center">
        <div
          aria-hidden
          className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-2xl"
        />
        <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4 relative">
          Give them a plan built for them.
        </h2>
        <p className="text-emerald-100 mb-8 max-w-md mx-auto relative">
          7 days free. A few minutes of intake. A full week of personalized training on the other side.
        </p>
        <Link href="/intake" className="relative inline-block">
          <Button variant="inverse" className="text-base px-6 py-3">
            Start your free trial
          </Button>
        </Link>
      </div>
    </section>
  );
}
