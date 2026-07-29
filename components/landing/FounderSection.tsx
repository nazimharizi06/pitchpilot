import Image from "next/image";

export function FounderSection() {
  return (
    <section className="bg-zinc-950 px-6 py-24">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-sm font-medium text-emerald-400 mb-6">Meet the Founder</p>
        <Image
          src="/brand/founder-photo.webp"
          alt="Nazim Harizi, PitchPilot founder"
          width={112}
          height={112}
          className="rounded-full object-cover mx-auto mb-6 h-28 w-28"
        />
        <p className="text-lg text-zinc-300 mb-6">
          &ldquo;PitchPilot started because I saw too many players trying to improve alone without knowing
          what to work on next. I wanted to build something that gives every player a structured plan based
          on their goals, schedule, and available equipment.&rdquo;
        </p>
        <p className="font-semibold text-white">Nazim Harizi</p>
        <p className="text-sm text-zinc-500">Founder • Collegiate Soccer Player • Youth Coach</p>
      </div>
    </section>
  );
}
