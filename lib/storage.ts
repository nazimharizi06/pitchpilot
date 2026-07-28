import type { IntakeData } from "@/lib/types";

// The generated plan and per-day progress live in Supabase now (see
// lib/planProgress.ts) so they follow a signed-in user across devices. This
// file is only a short-lived staging area for the intake→paywall→checkout
// funnel: a filled-out intake gets saved here before the user has a
// subscription yet (no Supabase row to write to at that point), and
// app/(dashboard)/plan/page.tsx picks it up to finish generating once they've
// subscribed — see app/intake/page.tsx.
const INTAKE_KEY = "pitchpilot:intake";

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveIntake(intake: IntakeData) {
  if (!isBrowser()) return;
  localStorage.setItem(INTAKE_KEY, JSON.stringify(intake));
}

export function loadIntake(): IntakeData | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(INTAKE_KEY);
  return raw ? (JSON.parse(raw) as IntakeData) : null;
}

export function clearAll() {
  if (!isBrowser()) return;
  localStorage.removeItem(INTAKE_KEY);
}
