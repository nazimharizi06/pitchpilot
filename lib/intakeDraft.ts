import type { ProfileForm } from "@/components/intake/ProfileStep";
import type { GoalsAndAssessment } from "@/lib/types";

const STORAGE_KEY = "pitchpilot:intake-draft";

// The in-progress /intake wizard, held in sessionStorage (not localStorage —
// tab-scoped, cleared on tab close) so it survives the redirect through
// /login and /auth/callback when someone starts onboarding before signing
// in. Never sent to any server until the user explicitly submits; cleared
// immediately after a successful /api/generate-plan call.
export interface IntakeDraft {
  step: number;
  profile: ProfileForm;
  goalsAndAssessment: GoalsAndAssessment;
  waiverAccepted: boolean;
  guardianName: string | null;
  guardianEmail: string | null;
  // Set when "Build My Plan" was clicked while signed out — lets /intake
  // auto-submit as soon as the user returns from auth, instead of making
  // them click the button a second time.
  readyToSubmit: boolean;
}

export function saveIntakeDraft(draft: IntakeDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Storage full/unavailable (private browsing, etc.) — the wizard still
    // works, it just won't survive a refresh or the auth redirect.
  }
}

export function loadIntakeDraft(): IntakeDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as IntakeDraft) : null;
  } catch {
    return null;
  }
}

export function clearIntakeDraft(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}
