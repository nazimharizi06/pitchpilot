"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribeToViewport(callback: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getIsMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

// Server render (and the first client paint, before hydration settles) has
// no `window` to check — default to the desktop image, which every hero
// section can render safely either way.
function getServerSnapshot() {
  return false;
}

const DESKTOP_SRC = "/media/hero-training.webp";
const MOBILE_SRC = "/media/hero-training-mobile.webp";

// Cinematic hero background, art-directed per breakpoint rather than just
// cropped with object-fit — a landscape desktop photo cover-cropped onto a
// portrait phone screen loses the subject entirely, so mobile gets its own
// portrait composition (/public/media/hero-training-mobile.webp) instead of
// a squeezed version of the desktop one.
//
// Only ever renders ONE <Image>, chosen by matchMedia, so a phone never
// fetches the desktop asset (or vice versa). If the mobile-specific file
// doesn't exist yet, it quietly falls back to the desktop image (repositioned
// for portrait) rather than showing nothing or a broken-image icon — drop a
// file at MOBILE_SRC and it starts being used automatically, no code changes
// needed.
export function HeroBackgroundImage() {
  const isMobile = useSyncExternalStore(subscribeToViewport, getIsMobileSnapshot, getServerSnapshot);
  const [mobileFailed, setMobileFailed] = useState(false);
  const [desktopFailed, setDesktopFailed] = useState(false);

  const useMobileAsset = isMobile && !mobileFailed;
  const src = useMobileAsset ? MOBILE_SRC : DESKTOP_SRC;
  const bothFailed = mobileFailed && desktopFailed;
  if ((isMobile && bothFailed) || (!isMobile && desktopFailed)) return null;

  // object-position: 75% horizontal keeps the player biased right / text-side
  // dark on every breakpoint. The mobile fallback (desktop photo, landscape,
  // cover-cropped into a portrait box) is height-constrained in that case —
  // cover scales to fill the taller dimension first, so the full image height
  // already shows and only horizontal position meaningfully matters; once a
  // real portrait-shot mobile asset exists, its vertical anchor (25%, biased
  // toward the upper frame for face/ball visibility) will matter for real.
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <Image
        key={src}
        src={src}
        alt=""
        fill
        priority
        quality={useMobileAsset ? 75 : 80}
        sizes="100vw"
        className={`object-cover animate-hero-pan ${useMobileAsset ? "object-[75%_25%]" : "object-[75%_center]"}`}
        onError={() => (useMobileAsset ? setMobileFailed(true) : setDesktopFailed(true))}
      />
    </div>
  );
}
