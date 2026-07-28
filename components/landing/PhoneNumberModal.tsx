"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { phoneSchema } from "@/lib/validation";

export function PhoneNumberModal({
  onSubmit,
  onCancel,
  submitting,
}: {
  onSubmit: (phone: string) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Enter a valid phone number");
      return;
    }
    setError(null);
    onSubmit(result.data);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="h-11 w-11 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center mb-4">
          <Phone className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-1">One more thing</h2>
        <p className="text-sm text-zinc-400 mb-5">
          We ask every new subscriber for a phone number — it&apos;s just used to keep free trials limited to
          one per person.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="tel"
            autoFocus
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {error && (
            <p className="text-xs text-red-400" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-3 mt-1">
            <Button type="button" variant="outlineDark" className="flex-1" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? "Continuing..." : "Continue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
