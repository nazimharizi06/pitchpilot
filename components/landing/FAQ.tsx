import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "What ages and skill levels is this for?",
    a: "U8 through high school (U17-U18). Skill level — Beginner, Intermediate, or Advanced — is rated separately from age, so a 15-year-old can still start as a Beginner.",
  },
  {
    q: "What if I don't have much equipment or space?",
    a: "The intake asks what you have — even if it's just a ball and a driveway. Plans only include drills that fit your actual equipment and space.",
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
    q: "Does my kid need to be supervised while training?",
    a: "Soccer training carries a normal risk of physical activity and injury. Drills should be followed at your own discretion and, where appropriate, under adult supervision — see the waiver in the intake for details.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="max-w-3xl mx-auto px-6 py-24 border-t border-zinc-200 dark:border-zinc-800">
      <div className="text-center mb-10">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">FAQ</p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Questions parents ask
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        {FAQS.map((item) => (
          <details
            key={item.q}
            className="group rounded-xl border border-zinc-200 dark:border-zinc-800 px-5 py-4 open:bg-zinc-50 dark:open:bg-zinc-900/50"
          >
            <summary className="flex items-center justify-between gap-3 cursor-pointer list-none font-medium text-zinc-900 dark:text-zinc-50">
              {item.q}
              <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
