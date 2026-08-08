import Image from "next/image";

export function FounderSection() {
  return (
    <section className="bg-zinc-950 px-6 py-12 md:py-20">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-sm font-medium text-emerald-400 mb-2">Meet the founder</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-5">
          Built by a player, for players.
        </h2>
        <Image
          src="/brand/founder-photo.webp"
          alt="Nazim Harizi, PitchPilot founder"
          width={96}
          height={96}
          className="rounded-full object-cover mx-auto mb-5 h-24 w-24"
        />
        <p className="text-base sm:text-lg text-zinc-300 mb-4">
          &ldquo;I saw too many players training without knowing what to actually work on. PitchPilot is the
          plan I wish I&apos;d had.&rdquo;
        </p>
        <p className="font-semibold text-white">Nazim Harizi</p>
        <p className="text-sm text-zinc-500">Founder • Collegiate Soccer Player • Youth Coach</p>
      </div>
    </section>
  );
}
