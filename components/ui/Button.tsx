import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "inverse" | "outlineDark";

const variantClass: Record<Variant, string> = {
  primary: "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300",
  secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
  ghost: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
  inverse: "bg-white text-emerald-700 hover:bg-emerald-50",
  // Deliberately not `dark:`-conditional — for surfaces that always render
  // dark regardless of the visitor's OS color-scheme preference (the
  // marketing homepage; see components/landing/*).
  outlineDark: "border border-zinc-700 text-zinc-100 hover:bg-zinc-800",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variantClass[variant]} ${className}`}
      {...props}
    />
  );
}
