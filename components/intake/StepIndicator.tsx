"use client";

export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2 flex-1">
          <div className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                i === current
                  ? "bg-emerald-600 text-white"
                  : i < current
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
              }`}
            >
              {i + 1}
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">{step}</span>
          </div>
          {i < steps.length - 1 && <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800 -mt-5" />}
        </div>
      ))}
    </div>
  );
}
