import { MailCheck } from "lucide-react";

// No progress bar here on purpose — unlike plan generation (a few seconds, bounded),
// waiting on a parent/guardian to check email has no knowable duration.
export function WaitingForGuardianScreen({ guardianName }: { guardianName: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 px-6 py-24 text-center min-h-[50vh]">
      <div className="h-14 w-14 rounded-2xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center animate-pulse">
        <MailCheck className="h-6 w-6" />
      </div>
      <div className="max-w-sm">
        <p className="text-white font-medium mb-1">Waiting on guardian confirmation</p>
        <p className="text-sm text-zinc-400">
          We&apos;ve sent a confirmation email to {guardianName ? `${guardianName}'s` : "the"} inbox. Once they
          confirm, this page will update on its own — no need to refresh.
        </p>
      </div>
      <div className="flex items-center gap-1.5" aria-hidden>
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" />
      </div>
    </div>
  );
}
