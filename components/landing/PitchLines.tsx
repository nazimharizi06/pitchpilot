// Decorative soccer-pitch line motif (center line, center circle, box
// corners) — gives the marketing page a graphic identity tied to the sport
// itself instead of a generic gradient blob. Pure SVG, no licensing risk.
export function PitchLines({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none ${className}`}
      fill="none"
    >
      <line x1="600" y1="0" x2="600" y2="700" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="600" cy="350" r="130" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="600" cy="350" r="4" fill="currentColor" />
      <path d="M0 180 H 160 V 520 H 0" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1200 180 H 1040 V 520 H 1200" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
