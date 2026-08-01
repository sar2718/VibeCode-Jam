import type { LocaleCode } from "@/types/common";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/utils/cn";

const options: LocaleCode[] = ["ru", "en"];

export function LocaleToggle() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-white/80 p-1 shadow-sm dark:border-white/10 dark:bg-white/5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          className={cn(
            "rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition",
            locale === option
              ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
              : "text-slate-500 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
