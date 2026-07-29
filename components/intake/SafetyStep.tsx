"use client";

import type { AccountType } from "@/lib/types";
import { Field, darkInputClass } from "@/components/ui/Field";
import { WaiverText } from "@/components/shared/WaiverText";

const MINOR_AGE_CUTOFF = 18;

export function SafetyStep({
  accountType,
  age,
  injuryNotes,
  onInjuryNotesChange,
  guardianName,
  onGuardianNameChange,
  guardianEmail,
  onGuardianEmailChange,
  waiverAccepted,
  onWaiverChange,
}: {
  accountType: AccountType;
  age: number;
  injuryNotes: string | null;
  onInjuryNotesChange: (val: string | null) => void;
  guardianName: string | null;
  onGuardianNameChange: (val: string | null) => void;
  guardianEmail: string | null;
  onGuardianEmailChange: (val: string | null) => void;
  waiverAccepted: boolean;
  onWaiverChange: (val: boolean) => void;
}) {
  const isMinorPlayer = accountType === "player" && age < MINOR_AGE_CUTOFF;

  const acknowledgmentLabel = isMinorPlayer
    ? "I am this player's parent or legal guardian. Once I confirm via the email we'll send, I agree to the waiver above on their behalf."
    : accountType === "parent"
      ? "I have read, understood, and agree to the waiver above on behalf of the player."
      : "I have read, understood, and agree to the waiver above.";

  return (
    <div className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-200">
          Any current injuries or physical limitations we should know about?{" "}
          <span className="font-normal text-zinc-500">(optional)</span>
        </span>
        <textarea
          className={`${darkInputClass} min-h-24`}
          value={injuryNotes ?? ""}
          onChange={(e) => onInjuryNotesChange(e.target.value || null)}
          placeholder="Leave blank if none"
        />
      </label>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm text-zinc-300">
        <WaiverText />

        {isMinorPlayer && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field dark label="Parent or guardian full name">
              <input
                type="text"
                className={darkInputClass}
                value={guardianName ?? ""}
                onChange={(e) => onGuardianNameChange(e.target.value || null)}
                placeholder="Full legal name"
              />
            </Field>
            <Field dark label="Parent or guardian email">
              <input
                type="email"
                className={darkInputClass}
                value={guardianEmail ?? ""}
                onChange={(e) => onGuardianEmailChange(e.target.value || null)}
                placeholder="parent@example.com"
              />
            </Field>
            <p className="text-xs text-zinc-500 sm:col-span-2">
              We&apos;ll send a confirmation email here before the plan is created — a typed name alone isn&apos;t
              enough to verify who&apos;s actually accepting this waiver.
            </p>
          </div>
        )}

        <label className="flex items-center gap-2 font-medium text-white">
          <input
            type="checkbox"
            checked={waiverAccepted}
            onChange={(e) => onWaiverChange(e.target.checked)}
            className="h-4 w-4 accent-emerald-500 shrink-0"
          />
          {acknowledgmentLabel}
        </label>
      </div>
    </div>
  );
}
