import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

type Locale = "ru" | "en";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDateKey(value?: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function buildMonthMatrix(monthDate: Date) {
  const first = startOfMonth(monthDate);
  const startWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let i = 0; i < startWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function normalizeRange(start?: string, end?: string) {
  if (!start && !end) return { start: undefined, end: undefined };
  if (start && end && start > end) return { start: end, end: start };
  return { start, end };
}

function isWithinRange(value: string, start?: string, end?: string) {
  if (!start || !end) return false;
  return value >= start && value <= end;
}

function formatDisplay(start?: string, end?: string, locale: Locale = "ru") {
  if (!start && !end) return locale === "ru" ? "Выберите диапазон" : "Select range";
  const format = (value?: string) => {
    if (!value) return "";
    const date = parseDateKey(value);
    return date
      ? new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
          day: "numeric",
          month: "short",
          year: "numeric"
        }).format(date)
      : value;
  };
  return end ? `${format(start)} — ${format(end)}` : format(start);
}

export function DateRangeField({
  label,
  start,
  end,
  onChange,
  locale = "ru"
}: {
  label?: string;
  start?: string;
  end?: string;
  onChange: (value: { start?: string; end?: string }) => void;
  locale?: Locale;
}) {
  const initialMonth = parseDateKey(start) ?? new Date();
  const [open, setOpen] = useState(false);
  const [anchorMonth, setAnchorMonth] = useState(startOfMonth(initialMonth));
  const rootRef = useRef<HTMLDivElement | null>(null);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
        month: "long",
        year: "numeric"
      }).format(anchorMonth),
    [anchorMonth, locale]
  );

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const weekdays = locale === "ru" ? ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  function handleDayClick(day: Date) {
    const value = toDateKey(day);
    const normalized = normalizeRange(start, end);

    if (!normalized.start || (normalized.start && normalized.end)) {
      onChange({ start: value, end: undefined });
      return;
    }

    if (value < normalized.start) {
      onChange({ start: value, end: normalized.start });
      return;
    }

    if (value === normalized.start) {
      onChange({ start: value, end: value });
      setOpen(false);
      return;
    }

    onChange({ start: normalized.start, end: value });
    setOpen(false);
  }

  const cells = buildMonthMatrix(anchorMonth);

  return (
    <div className="relative flex w-full flex-col gap-2" ref={rootRef}>
      {label ? <span className="text-sm font-medium text-subtle">{label}</span> : null}
      <button
        type="button"
        className="flex h-11 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-left text-sm shadow-sm transition hover:border-slate-300 dark:border-white/10 dark:bg-white/5"
        onClick={() => setOpen((value) => !value)}
      >
        <span>{formatDisplay(start, end, locale)}</span>
        <CalendarDays className="h-4 w-4 text-subtle" />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-30 mt-2 w-[min(360px,calc(100vw-2rem))] rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-950">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold capitalize">{monthLabel}</p>
              <p className="mt-1 text-xs text-subtle">{formatDisplay(start, end, locale)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"
                onClick={() => setAnchorMonth((value) => addMonths(value, -1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"
                onClick={() => setAnchorMonth((value) => addMonths(value, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.16em] text-subtle">
            {weekdays.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2">
            {cells.map((day, dayIndex) => {
              if (!day) return <div key={`empty-${dayIndex}`} className="h-10" />;
              const key = toDateKey(day);
              const isStart = key === start;
              const isEnd = key === end;
              const inRange = isWithinRange(key, start, end);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "h-10 rounded-2xl text-sm transition",
                    isStart || isEnd
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : inRange
                        ? "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-100"
                        : "hover:bg-slate-200 dark:hover:bg-white/10"
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
