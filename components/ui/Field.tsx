import type { ReactNode } from "react";

// `dark` forces the always-dark styling used on forced-dark surfaces (the
// marketing homepage, intake) — same precedent as the `dark` prop on
// Button/Header. Without it, Field stays adaptive light/dark (e.g. login).
export function Field({
  label,
  error,
  dark = false,
  children,
}: {
  label: string;
  error?: string;
  dark?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className={dark ? "font-medium text-zinc-200" : "font-medium text-zinc-800 dark:text-zinc-200"}>
        {label}
      </span>
      {children}
      {error && <span className={dark ? "text-red-400 text-xs" : "text-red-600 dark:text-red-400 text-xs"}>{error}</span>}
    </label>
  );
}

export const inputClass =
  "rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500";

export const darkInputClass =
  "rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500";
