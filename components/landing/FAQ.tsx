import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";

const FAQS = [
  {
    q: "What ages and skill levels is this for?",
    a: "U8 through high school. Skill level — Beginner, Intermediate, or Advanced — is rated separately from age, so a 15-year-old can still start as a Beginner.",
  },
  {
    q: "What if I don't have much equipment or space?",
    a: "The intake asks what you have — even if it's just a ball and a driveway. Plans only include drills that fit what you've actually got.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — every plan starts with a 7-day free trial before billing begins.",
  },
  {
    q: "Can I cancel?",
    a: "Anytime, going forward. There are no refunds for time already billed.",
  },
  {
    q: "What if I'm under 18?",
    a: "If a player is under 18, a parent or guardian gets an email confirmation link, and no plan is generated until they confirm.",
  },
  {
    q: "Is training supervised?",
    a: "Soccer training carries a normal risk of physical activity and injury. Follow drills at your own discretion and, where appropriate, under adult supervision — see the waiver in the intake for details.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-zinc-900/30 border-y border-zinc-800 px-6 py-10 md:py-24">
      <div className="max-w-3xl mx-auto">
        <Reveal className="text-center mb-6 md:mb-10">
          <p className="text-sm font-medium text-emerald-400 mb-2">FAQ</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white">Questions before you start</h2>
        </Reveal>
        <div className="flex flex-col gap-3">
          {FAQS.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-zinc-800 px-5 py-4 open:bg-zinc-900/60"
            >
              <summary className="flex items-center justify-between gap-3 cursor-pointer list-none font-medium text-white">
                {item.q}
                <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="text-sm text-zinc-400 mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
