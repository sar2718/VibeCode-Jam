import { cn } from "@/utils/cn";

export function ProgressBar({
  value,
  className,
  showLabel = false,
  label
}: {
  value: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel ? (
        <div className="flex items-center justify-between text-xs text-subtle">
          <span>{label ?? ""}</span>
          <span>{Math.round(safeValue)}%</span>
        </div>
      ) : null}
      <div className="h-2.5 rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-300"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
