export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-semibold text-white">
          <span className="h-6 w-6 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
            P
          </span>
          PitchPilot
        </div>
        <p className="text-xs text-zinc-500 text-center max-w-md">
          PitchPilot is a training tool, not a substitute for coaching supervision. Always train in a safe space
          appropriate for your skill level.
        </p>
      </div>
    </footer>
  );
}
