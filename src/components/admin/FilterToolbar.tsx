import type { ReactNode } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";

export function FilterChip({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
        active
          ? "border-indigo-500/50 bg-indigo-500/12 text-indigo-700 shadow-sm shadow-indigo-500/10 dark:border-indigo-300/35 dark:bg-indigo-400/18 dark:text-indigo-50"
          : "border-slate-200/90 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export function FilterGroup({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function FilterToolbar({
  query,
  onQueryChange,
  searchPlaceholder,
  showFilters,
  onToggleFilters,
  activeCount,
  toolbarActions,
  onReset,
  children
}: {
  query: string;
  onQueryChange: (value: string) => void;
  searchPlaceholder: string;
  showFilters: boolean;
  onToggleFilters: () => void;
  activeCount: number;
  toolbarActions?: ReactNode;
  onReset?: () => void;
  children?: ReactNode;
}) {
  const { locale } = useI18n();
  const hasFilters = activeCount > 0 || query.trim().length > 0;

  return (
    <div className="relative z-40 space-y-3 overflow-visible rounded-[28px] border border-slate-200/80 bg-white/72 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.045]">
      <div className="relative z-40 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1 min-w-0">
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 rounded-2xl"
            endAdornment={<Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
          />
        </div>

        <div className="relative z-50 flex items-stretch gap-2 self-end lg:self-auto">
          {toolbarActions}
          <Button variant="outline" size="sm" className="h-10 rounded-2xl px-4" onClick={onToggleFilters}>
            <SlidersHorizontal className="h-4 w-4" />
            {locale === "ru" ? "\u0424\u0438\u043b\u044c\u0442\u0440\u044b" : "Filters"}
            {hasFilters ? (
              <Badge variant="neutral" className="ml-1 px-2 py-0.5">
                {activeCount + (query.trim() ? 1 : 0)}
              </Badge>
            ) : null}
          </Button>
          {hasFilters && onReset ? (
            <Button variant="ghost" size="sm" className="h-10 rounded-2xl px-3" onClick={onReset}>
              <X className="h-4 w-4" />
              {locale === "ru" ? "\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c" : "Reset"}
            </Button>
          ) : null}
        </div>
      </div>

      {(showFilters || hasFilters) && children ? (
        <div className="relative z-10 grid gap-3 rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/30 lg:grid-cols-3">
          {children}
        </div>
      ) : null}
    </div>
  );
}

