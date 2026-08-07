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
          &ldquo;I saw too many players training without knowing what to actually work on. PitchPilot is the
          plan I wish I&apos;d had.&rdquo;
        </p>
        <p className="font-semibold text-white">Nazim Harizi</p>
        <p className="text-sm text-zinc-500">Founder • Collegiate Soccer Player • Youth Coach</p>
      </div>
    </section>
  );
}
