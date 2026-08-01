import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, helperText, className, children, ...props },
  ref
) {
  return (
    <label className="flex w-full flex-col gap-2">
      {label ? <span className="text-sm font-medium text-subtle">{label}</span> : null}
      <select
        ref={ref}
        className={cn(
          "h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-indigo-300",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {helperText ? <span className="text-xs text-subtle">{helperText}</span> : null}
    </label>
  );
});
