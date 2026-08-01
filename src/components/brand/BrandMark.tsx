import { Layers3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/utils/cn";

export function BrandMark({ className }: { className?: string }) {
  const { t } = useI18n();

  return (
    <Link to="/" className={cn("inline-flex items-center gap-3", className)}>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15 dark:bg-white dark:text-slate-950">
        <Layers3 className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold tracking-tight">{t("app.name")}</p>
        <p className="text-xs text-subtle">{t("app.subtitle")}</p>
      </div>
    </Link>
  );
}
