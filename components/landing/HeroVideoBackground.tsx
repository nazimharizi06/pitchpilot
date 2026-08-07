"use client";

import { useState, useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

// Server render (and the first client render, before hydration settles) has
// no `window` to check, so it assumes motion is fine — useSyncExternalStore
// is what lets the real client value replace that guess afterward without
// React flagging a hydration mismatch.
function getServerSnapshot() {
  return false;
}

// Optional cinematic hero background. No soccer video exists in the repo yet
// — this looks for /media/hero-training.mp4 and quietly renders nothing if
// it's missing (no broken-image icon, no layout shift, since it's absolutely
// positioned behind content that never depends on it). Drop a muted, looping
// clip at that path and it starts playing automatically, no code changes
// needed. Also opts out entirely under prefers-reduced-motion.
export function HeroVideoBackground() {
  const [failed, setFailed] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeToReducedMotion, getReducedMotionSnapshot, getServerSnapshot);

  if (failed || reducedMotion) return null;

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <video
        className="h-full w-full object-cover opacity-40"
        src="/media/hero-training.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        onError={() => setFailed(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/70 to-zinc-950" />
    </div>
  );
}
