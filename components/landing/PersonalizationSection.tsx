import { MapPin, Target, Gauge, CalendarDays } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";

// The four inputs called out on the homepage — real fields from the actual
// intake (lib/types.ts). Equipment/space are also real intake inputs but
// aren't part of this compact homepage summary; the full picture lives in
// the product itself, not this section.
const CHIPS = [
  { icon: MapPin, label: "Your position" },
  { icon: Target, label: "Your goals" },
  { icon: Gauge, label: "Your level" },
  { icon: CalendarDays, label: "Your schedule" },
];

export function PersonalizationSection() {
  return (
    <section className="bg-zinc-900/30 border-y border-zinc-800 px-6 py-12 md:py-20">
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <p className="text-sm font-medium text-emerald-400 mb-2">Built around you</p>
          <p className="text-zinc-400 max-w-lg mx-auto mb-6 text-sm sm:text-base">
            Your answers shape what you train, how often you train, and which drills make your sessions.
          </p>
        </Reveal>
        <Reveal delay={80} className="flex flex-wrap items-center justify-center gap-2.5">
          {CHIPS.map((chip) => (
            <div
              key={chip.label}
              className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 pl-2.5 pr-4 py-2"
            >
              <span className="h-6 w-6 rounded-full bg-emerald-950/60 text-emerald-400 flex items-center justify-center shrink-0">
                <chip.icon className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-medium text-zinc-200">{chip.label}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
