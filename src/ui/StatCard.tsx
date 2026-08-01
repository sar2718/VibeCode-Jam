import type { ReactNode } from "react";
import { Card } from "@/ui/Card";

export function StatCard({
  title,
  value,
  hint,
  icon
}: {
  title: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-subtle">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
          {hint ? <p className="mt-2 text-sm text-subtle">{hint}</p> : null}
        </div>
        {icon ? (
          <div className="rounded-2xl bg-slate-950/5 p-3 text-slate-700 dark:bg-white/10 dark:text-slate-100">
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
