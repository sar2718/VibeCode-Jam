import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string | null;
  endAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, error, className, endAdornment, ...props },
  ref
) {
  return (
    <label className="flex w-full flex-col gap-2">
      {label ? <span className="text-sm font-medium text-subtle">{label}</span> : null}
      <div className="relative">
        <input
          ref={ref}
          className={cn(
            "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-0 focus-visible:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white/20",
            !!endAdornment && "pr-12",
            error && "border-rose-400 focus:border-rose-400 dark:focus:border-rose-400",
            className
          )}
          {...props}
        />
        {endAdornment ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">{endAdornment}</div>
        ) : null}
      </div>
      {error ? (
        <span className="text-xs text-rose-500">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-subtle">{helperText}</span>
      ) : null}
    </label>
  );
});
