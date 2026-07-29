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
}: {
  guardianEmail: string;
  guardianName: string;
  token: string;
}) {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const confirmUrl = `${site}/api/guardian-consent/confirm?token=${encodeURIComponent(token)}`;

  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "PitchPilot <noreply@pitch-pilot-app.com>",
    to: guardianEmail,
    subject: "Confirm your child's PitchPilot training plan",
    html: `
      <p>Hi ${guardianName},</p>
      <p>
        A PitchPilot account listed you as their parent or guardian to approve a personalized soccer
        training plan for a player under 18.
      </p>
      <p>
        If that's you, click below to confirm and build the plan:
      </p>
      <p><a href="${confirmUrl}">Confirm and create the training plan</a></p>
      <p>If you weren't expecting this, you can safely ignore this email.</p>
    `,
  });
}
