import type { IntakeData, Plan } from "@/lib/types";

// No accounts/DB this pass — intake + generated plan live in the browser only.
const INTAKE_KEY = "pitchpilot:intake";
const PLAN_KEY = "pitchpilot:plan";
const UNLOCKED_KEY = "pitchpilot:unlockedSessions";

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

export function savePlan(plan: Plan) {
  if (!isBrowser()) return;
  localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  localStorage.setItem(UNLOCKED_KEY, JSON.stringify(1));
}

export function loadPlan(): Plan | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(PLAN_KEY);
  return raw ? (JSON.parse(raw) as Plan) : null;
}

export function getUnlockedSessionCount(): number {
  if (!isBrowser()) return 1;
  const raw = localStorage.getItem(UNLOCKED_KEY);
  return raw ? (JSON.parse(raw) as number) : 1;
}

export function unlockNextSession(totalSessions: number) {
  if (!isBrowser()) return;
  const current = getUnlockedSessionCount();
  const next = Math.min(current + 1, totalSessions);
  localStorage.setItem(UNLOCKED_KEY, JSON.stringify(next));
}

export function clearAll() {
  if (!isBrowser()) return;
  localStorage.removeItem(INTAKE_KEY);
  localStorage.removeItem(PLAN_KEY);
  localStorage.removeItem(UNLOCKED_KEY);
}
