import { useI18n } from "@/hooks/useI18n";
import type { ScoreBreakdownItem } from "@/types/report";
import { ProgressBar } from "@/ui/ProgressBar";
import { textOf } from "@/utils/i18n";

export function ReportScoreBreakdown({ items }: { items: ScoreBreakdownItem[] }) {
  const { locale } = useI18n();

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={textOf(item.label, locale)} className="rounded-2xl border border-slate-200/80 p-4 dark:border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{textOf(item.label, locale)}</p>
              <p className="mt-1 text-xs text-subtle">{textOf(item.hint, locale)}</p>
            </div>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
          <ProgressBar className="mt-3" value={item.value} />
        </div>
      ))}
    </div>
  );
}
