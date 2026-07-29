// The single source of truth for the waiver clauses — reused by the /intake wizard
// (components/intake/SafetyStep.tsx) and the workout builder's inline waiver
// (components/dashboard/WorkoutBuilder.tsx), so the two paths never drift apart.
// Mirrors legal/liability-waiver.md — keep both in sync if this text changes.
export function WaiverText() {
  return (
    <>
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
          laws of the State of New York, USA. If any provision is found unenforceable, the remaining
          provisions stay in effect.
        </p>
      </div>
    </>
  );
}
