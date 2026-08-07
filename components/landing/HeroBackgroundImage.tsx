"use client";

import { useState } from "react";
import Image from "next/image";

// Cinematic hero background. No soccer photography exists in the repo yet —
// this looks for /media/hero-training.webp and quietly renders nothing if
// it's missing (no broken-image icon, no layout shift, since it's absolutely
// positioned behind content that never depends on it). Drop a photo at that
// path and it appears automatically, no code changes needed. Purely
// atmospheric/decorative — no text or UI is baked into the image itself.
export function HeroBackgroundImage() {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <Image
        src="/media/hero-training.webp"
        alt=""
        fill
        priority
        quality={80}
        sizes="100vw"
        className="object-cover object-[75%_center] animate-hero-pan"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
