import { CheckCircle2, XCircle } from "lucide-react";
import { Header } from "@/components/landing/Header";

const STATUS_COPY = {
  confirmed: {
    icon: CheckCircle2,
    title: "Thanks — you're all set",
    body: "The player can go back to their PitchPilot account now — it's ready for them.",
  },
  already_confirmed: {
    icon: CheckCircle2,
    title: "Already confirmed",
    body: "This request was already confirmed. The player's account should already be ready.",
  },
  invalid: {
    icon: XCircle,
    title: "This link isn't valid",
    body: "This confirmation link is invalid or has expired. Ask the player to send a fresh request from their account.",
  },
} as const;

export default async function GuardianConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const copy = STATUS_COPY[status as keyof typeof STATUS_COPY] ?? STATUS_COPY.invalid;
  const Icon = copy.icon;

  return (
    <>
      <Header dark />
      <main className="bg-zinc-950 min-h-screen">
        <div className="max-w-md mx-auto px-6 py-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center mx-auto mb-5">
            <Icon className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">{copy.title}</h1>
          <p className="text-sm text-zinc-400">{copy.body}</p>
        </div>
      </main>
    </>
  );
}
