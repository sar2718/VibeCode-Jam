import { AlertTriangle, CheckCircle2, Info, OctagonX } from "lucide-react";
import { cn } from "@/utils/cn";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

const iconMap = {
  default: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: OctagonX
} as const;

const toneMap = {
  default:
    "border-slate-200/90 bg-white/96 text-slate-800 shadow-[0_18px_50px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-900/94 dark:text-slate-100 dark:shadow-[0_18px_50px_rgba(2,6,23,0.35)]",
  success:
    "border-emerald-300/70 bg-emerald-50/96 text-emerald-950 shadow-[0_18px_50px_rgba(16,185,129,0.15)] dark:border-emerald-400/20 dark:bg-emerald-500/14 dark:text-emerald-50 dark:shadow-[0_18px_50px_rgba(5,150,105,0.24)]",
  warning:
    "border-amber-300/70 bg-amber-50/96 text-amber-950 shadow-[0_18px_50px_rgba(245,158,11,0.16)] dark:border-amber-400/20 dark:bg-amber-500/14 dark:text-amber-50 dark:shadow-[0_18px_50px_rgba(217,119,6,0.25)]",
  danger:
    "border-rose-300/70 bg-rose-50/96 text-rose-950 shadow-[0_18px_50px_rgba(244,63,94,0.16)] dark:border-rose-400/20 dark:bg-rose-500/14 dark:text-rose-50 dark:shadow-[0_18px_50px_rgba(225,29,72,0.24)]"
} as const;

export function ToastViewport({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="pointer-events-none fixed right-4 top-[78px] z-[90] flex w-[380px] max-w-[calc(100vw-2rem)] flex-col gap-3 sm:right-6 sm:top-[86px]">
      {toasts.map((toast) => {
        const variant = toast.variant ?? "default";
        const Icon = iconMap[variant];

        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto rounded-2xl border p-4 backdrop-blur fade-up",
              toneMap[variant]
            )}
          >
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? <p className="text-sm opacity-90">{toast.description}</p> : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
