import { Resend } from "resend";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY!);
  return resend;
}

export async function sendGuardianConsentEmail({
  guardianEmail,
  guardianName,
  token,
  purpose,
}: {
  guardianEmail: string;
  guardianName: string;
  token: string;
  purpose: "plan" | "waiver_only";
}) {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const confirmUrl = `${site}/api/guardian-consent/confirm?token=${encodeURIComponent(token)}`;

  const body =
    purpose === "plan"
      ? {
          subject: "Confirm your child's PitchPilot training plan",
          intro:
            "A PitchPilot account listed you as their parent or guardian to approve a personalized soccer training plan for a player under 18.",
          cta: "Confirm and create the training plan",
        }
      : {
          subject: "Confirm your child's PitchPilot waiver",
          intro:
            "A PitchPilot account listed you as their parent or guardian to accept the liability waiver for a player under 18 building their own training sessions.",
          cta: "Confirm and accept the waiver",
        };

  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "PitchPilot <noreply@pitch-pilot-app.com>",
    to: guardianEmail,
    subject: body.subject,
    html: `
      <p>Hi ${guardianName},</p>
      <p>${body.intro}</p>
      <p>If that's you, click below to confirm:</p>
      <p><a href="${confirmUrl}">${body.cta}</a></p>
      <p>If you weren't expecting this, you can safely ignore this email.</p>
    `,
  });
}
