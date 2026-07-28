"use client";

import { Check } from "lucide-react";
import type { Drill } from "@/lib/types";

export function DrillChecklistItem({
  drill,
  repsDuration,
  completed,
  onToggle,
  readOnly = false,
}: {
  drill: Drill;
  repsDuration: string;
  completed: boolean;
  onToggle?: () => void;
  readOnly?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
        completed ? "border-emerald-800 bg-emerald-950/20" : "border-zinc-800 bg-zinc-900/40"
      }`}
    >
      {readOnly ? (
        <div
          aria-hidden
          className={`mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
            completed ? "bg-emerald-600 border-emerald-600 text-white" : "border-zinc-600 text-transparent"
          }`}
        >
          <Check className="h-3 w-3" />
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={completed}
          aria-label={completed ? `Mark ${drill.name} as not done` : `Mark ${drill.name} as done`}
          className={`mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
            completed ? "bg-emerald-600 border-emerald-600 text-white" : "border-zinc-600 text-transparent"
          }`}
        >
          <Check className="h-3 w-3" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h4 className={`font-medium text-sm ${completed ? "text-zinc-400 line-through" : "text-white"}`}>
            {drill.name}
          </h4>
          <span className="text-xs text-zinc-500 whitespace-nowrap">{repsDuration}</span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">{drill.instructions}</p>
      </div>
    </div>
  );
}
