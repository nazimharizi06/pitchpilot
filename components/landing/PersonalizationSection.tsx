import { MapPin, Target, Gauge, CalendarDays, Wrench, Trees } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";

// Six real inputs from the actual intake (lib/types.ts) — shown, not
// explained, per the brief. No invented fields.
const CARDS = [
  {
    icon: MapPin,
    label: "Position",
    detail: "Striker, center back, keeper — 8 positions, each weighted differently",
  },
  {
    icon: Target,
    label: "Your goals",
    detail: "Shooting, dribbling, defending, and 7 more categories to pick from",
  },
  {
    icon: Gauge,
    label: "Skill level",
    detail: "Rated per goal, not by age — beginner to advanced",
  },
  {
    icon: CalendarDays,
    label: "Schedule",
    detail: "However many days a week you can actually train",
  },
  {
    icon: Wrench,
    label: "Equipment",
    detail: "Cones, a wall, a ladder, a goal — or just a ball",
  },
  {
    icon: Trees,
    label: "Space",
    detail: "Driveway, yard, indoors, or a full field",
  },
];

export function PersonalizationSection() {
  return (
    <section className="bg-zinc-900/30 border-y border-zinc-800 px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-14">
          <p className="text-sm font-medium text-emerald-400 mb-2">Built around you</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Every plan starts with what&apos;s true about your game
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {CARDS.map((card, i) => (
            <Reveal key={card.label} delay={i * 60}>
              <div className="h-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-emerald-800 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-emerald-950/60 text-emerald-400 flex items-center justify-center mb-4">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm text-white mb-1">{card.label}</h3>
                <p className="text-xs text-zinc-400">{card.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
