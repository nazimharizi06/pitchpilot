"use client";

import type { AccountType } from "@/lib/types";
import { Field, darkInputClass } from "@/components/ui/Field";

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
        <p className="font-medium text-amber-400 mb-3">
          Draft waiver — pending attorney review. Not yet confirmed to be enforceable in any jurisdiction.
        </p>

        <div className="max-h-56 overflow-y-auto pr-2 flex flex-col gap-3 text-zinc-400 mb-4">
          <p>
            <span className="font-semibold text-zinc-200">1. Assumption of Risk.</span> Soccer training, like any
            physical activity, carries an inherent risk of injury, including sprains, strains, fractures,
            collisions, and other physical harm. By using PitchPilot, the participant — or, if the participant is
            under 18, their parent or legal guardian — voluntarily assumes all such risks.
          </p>
          <p>
            <span className="font-semibold text-zinc-200">2. Independent Activity.</span> PitchPilot provides
            training plans and instructions only; it does not supervise sessions in person. The participant, and/or
            their parent or guardian, is responsible for choosing a safe environment, using equipment properly, and
            training within their own physical ability.
          </p>
          <p>
            <span className="font-semibold text-zinc-200">3. Release of Liability.</span> To the fullest extent
            permitted by law, the participant — and, where applicable, their parent or guardian — releases
            PitchPilot and its owners, employees, and affiliates from claims or damages arising from participation
            in PitchPilot training, except for claims arising from PitchPilot&apos;s own gross negligence or
            willful misconduct.
          </p>
          <p>
            <span className="font-semibold text-zinc-200">4. Adult Participants.</span> If the participant is 18 or
            older, they may read and accept this waiver themselves, confirming they are legally authorized to do so
            on their own behalf.
          </p>
          <p>
            <span className="font-semibold text-zinc-200">5. Guardian Consent for Minors.</span> If the participant
            is under 18, this waiver must instead be read and accepted by a parent or legal guardian, who confirms
            they have the legal authority to do so on the participant&apos;s behalf.
          </p>
          <p>
            <span className="font-semibold text-zinc-200">6. Indemnification.</span> The participant — or their
            parent or guardian — agrees to indemnify PitchPilot against third-party claims arising from the
            participant&apos;s use of the training plans.
          </p>
          <p>
            <span className="font-semibold text-zinc-200">7. Governing Law.</span> This waiver is governed by the
            laws of [state/jurisdiction — to be finalized by counsel]. If any provision is found unenforceable, the
            remaining provisions stay in effect.
          </p>
        </div>

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
