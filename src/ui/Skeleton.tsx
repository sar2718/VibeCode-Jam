import { cn } from "@/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-2xl bg-[linear-gradient(110deg,rgba(148,163,184,0.18),rgba(255,255,255,0.45),rgba(148,163,184,0.18))] bg-[length:200%_100%] dark:bg-[linear-gradient(110deg,rgba(255,255,255,0.06),rgba(255,255,255,0.12),rgba(255,255,255,0.06))]",
        className
      )}
    />
  );
}
