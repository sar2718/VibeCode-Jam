import { initials } from "@/utils/format";
import { cn } from "@/utils/cn";

export function Avatar({
  name,
  size = "md"
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950",
        size === "sm" && "h-9 w-9 text-xs",
        size === "md" && "h-11 w-11 text-sm",
        size === "lg" && "h-14 w-14 text-base"
      )}
    >
      {initials(name)}
    </div>
  );
}
