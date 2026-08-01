import { AlertTriangle } from "lucide-react";
import { Button } from "@/ui/Button";
import { cn } from "@/utils/cn";

export function ErrorState({
  title,
  message,
  actionLabel,
  onAction,
  compact = false
}: {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[22px] border border-rose-500/15 bg-rose-500/6 text-rose-900 dark:border-rose-400/15 dark:bg-rose-400/10 dark:text-rose-100",
        compact ? "px-4 py-3" : "p-6"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl bg-white/80 p-2 text-rose-600 shadow-sm dark:bg-white/10 dark:text-rose-200">
          <AlertTriangle className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </div>
        <div className="min-w-0 flex-1">
          {title ? <h3 className={cn("font-semibold", compact ? "text-sm" : "text-lg")}>{title}</h3> : null}
          <p className={cn("text-rose-800/90 dark:text-rose-100/90", compact ? "text-sm leading-6" : "mt-1 text-sm leading-7")}>
            {message}
          </p>
          {actionLabel && onAction ? (
            <Button className="mt-4" variant="danger" size={compact ? "sm" : "md"} onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
