"use client";

import { inputClass } from "@/components/ui/Field";

export function SafetyStep({
  injuryNotes,
  onInjuryNotesChange,
  waiverAccepted,
  onWaiverChange,
}: {
  injuryNotes: string | null;
  onInjuryNotesChange: (val: string | null) => void;
  waiverAccepted: boolean;
  onWaiverChange: (val: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-800 dark:text-zinc-200">
          Any current injuries or physical limitations we should know about? <span className="font-normal text-zinc-500">(optional)</span>
        </span>
        <textarea
          className={`${inputClass} min-h-24`}
          value={injuryNotes ?? ""}
          onChange={(e) => onInjuryNotesChange(e.target.value || null)}
          placeholder="Leave blank if none"
        />
      </label>

      <div className="rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4 text-sm text-zinc-700 dark:text-zinc-300">
        <p className="font-medium mb-2">Liability waiver (placeholder — not legal language)</p>
        <p className="mb-3">
          Soccer training involves physical activity and carries a risk of injury. By continuing, you acknowledge
          that risk and agree that PitchPilot drills are followed at your own discretion and, where applicable, under
          appropriate adult supervision. This is placeholder text — real waiver language needs review by a lawyer
          before this app is used publicly or charges money.
        </p>
        <label className="flex items-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={waiverAccepted}
            onChange={(e) => onWaiverChange(e.target.checked)}
            className="h-4 w-4"
          />
          I acknowledge and accept the waiver above
        </label>
      </div>
    </div>
  );
}
