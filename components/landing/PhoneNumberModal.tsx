"use client";

import { useState } from "react";
import { Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { phoneSchema } from "@/lib/validation";
import { normalizePhone } from "@/lib/phone";
import { createClient } from "@/lib/supabase/client";

// Two-step, real ownership verification (not just a format check) before a
// phone number can ever reach user_phones/trial_usage — otherwise anyone
// could type a number they don't own to dodge the one-trial-per-phone rule.
// Uses Supabase Auth's own phone-verification (already the project's auth
// provider) rather than a bespoke OTP/Twilio integration: updateUser({phone})
// sends the SMS code, verifyOtp(..., type: "phone_change") confirms it — both
// go straight from the browser to Supabase, so no OTP codes or SMS-provider
// credentials ever touch this app's code.
export function PhoneNumberModal({
  onSubmit,
  onCancel,
  submitting,
}: {
  onSubmit: (phone: string) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [e164Phone, setE164Phone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function sendCode(target: string) {
    setError(null);
    setSending(true);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.updateUser({ phone: target });
    setSending(false);
    if (otpError) {
      setError(otpError.message || "Couldn't send a verification code. Check the number and try again.");
      return false;
    }
    return true;
  }

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Enter a valid phone number");
      return;
    }
    // Supabase's phone auth expects E.164 (+<country code><number>) — default
    // to US (+1) when no country code was entered, since the input doesn't
    // collect one separately.
    const normalized = normalizePhone(result.data);
    const target = normalized.startsWith("+") ? normalized : `+1${normalized}`;
    if (await sendCode(target)) {
      setE164Phone(target);
      setStep("code");
    }
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      setError("Enter the code we texted you");
      return;
    }
    setError(null);
    setVerifying(true);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: e164Phone,
      token: code.trim(),
      type: "phone_change",
    });
    setVerifying(false);
    if (verifyError) {
      setError(verifyError.message || "That code didn't match. Try again.");
      return;
    }
    // Pass the same verified E.164 value on to checkout so the server-side
    // check (app/api/checkout/route.ts) compares like-for-like against the
    // now-confirmed phone on this account.
    onSubmit(e164Phone);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        {step === "phone" ? (
          <>
            <div className="h-11 w-11 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center mb-4">
              <Phone className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">One more thing</h2>
            <p className="text-sm text-zinc-400 mb-5">
              We ask every new subscriber for a phone number — it&apos;s just used to keep free trials limited
              to one per person. We&apos;ll text you a code to confirm it&apos;s yours.
            </p>
            <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-3">
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
                <Button type="button" variant="outlineDark" className="flex-1" onClick={onCancel} disabled={sending}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={sending}>
                  {sending ? "Sending code..." : "Send code"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="h-11 w-11 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">Enter your code</h2>
            <p className="text-sm text-zinc-400 mb-5">We just texted a 6-digit code to {phone}.</p>
            <form onSubmit={handleCodeSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 tracking-widest placeholder:text-zinc-600 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              {error && (
                <p className="text-xs text-red-400" role="alert">
                  {error}
                </p>
              )}
              <div className="flex gap-3 mt-1">
                <Button
                  type="button"
                  variant="outlineDark"
                  className="flex-1"
                  onClick={() => {
                    setStep("phone");
                    setCode("");
                    setError(null);
                  }}
                  disabled={verifying || submitting}
                >
                  Change number
                </Button>
                <Button type="submit" className="flex-1" disabled={verifying || submitting}>
                  {verifying || submitting ? "Confirming..." : "Confirm"}
                </Button>
              </div>
              <button
                type="button"
                onClick={() => sendCode(e164Phone)}
                disabled={sending}
                className="text-xs text-zinc-500 hover:text-white transition-colors self-center"
              >
                {sending ? "Resending..." : "Didn't get it? Resend code"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
