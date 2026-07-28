import { Sparkles } from "lucide-react";

export function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 px-6 py-24 text-center min-h-[50vh]">
      <div className="h-14 w-14 rounded-2xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center animate-pulse">
        <Sparkles className="h-6 w-6" />
      </div>
      <p className="text-white font-medium max-w-sm">{message}</p>
      <div className="flex items-center gap-1.5" aria-hidden>
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" />
      </div>
    </div>
  );
}
