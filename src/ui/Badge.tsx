import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral";

const variants: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
  success: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200",
  warning: "bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200",
  danger: "bg-rose-500/10 text-rose-700 dark:bg-rose-400/15 dark:text-rose-200",
  info: "bg-sky-500/10 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200",
  neutral: "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-200"
};

export function Badge({
  variant = "default",
  className,
  children
}: {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
