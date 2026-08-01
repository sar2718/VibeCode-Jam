import type { LocaleCode } from "@/types/common";

function getIntlLocale(locale: LocaleCode) {
  return locale === "ru" ? "ru-RU" : "en-US";
}

function toValidDate(value?: string | number | Date | null) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value: string | undefined, locale: LocaleCode) {
  const date = toValidDate(value);
  if (!date) {
    return "\u2014";
  }

  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function formatMinutes(value: number, locale: LocaleCode) {
  if (locale === "ru") {
    if (value < 60) {
      return `${value} \u043c\u0438\u043d`;
    }

    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    return minutes ? `${hours} \u0447 ${minutes} \u043c\u0438\u043d` : `${hours} \u0447`;
  }

  if (value < 60) {
    return `${value} min`;
  }

  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
}

export function formatInterviewTitle(value: string) {
  if (!value) {
    return value;
  }

  if (!/^(Интервью|Interview)\s[-–—]\s/.test(value)) {
    return value;
  }

  return value
    .replace(/^(Интервью|Interview)\s[-–—]\s/, "$1 • ")
    .replace(/\s[-–—]\s/g, " • ");
}

export function formatDecision(
  decision: "strong_yes" | "yes" | "mixed" | "no",
  locale: LocaleCode
) {
  const map = {
    ru: {
      strong_yes: "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u043e\u0432\u0430\u0442\u044c",
      yes: "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u043e\u0432\u0430\u0442\u044c \u0441 \u043e\u0433\u043e\u0432\u043e\u0440\u043a\u0430\u043c\u0438",
      mixed: "\u0422\u0440\u0435\u0431\u0443\u0435\u0442 \u043e\u0431\u0441\u0443\u0436\u0434\u0435\u043d\u0438\u044f",
      no: "\u041d\u0435 \u0440\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u043e\u0432\u0430\u0442\u044c"
    },
    en: {
      strong_yes: "Recommend",
      yes: "Recommend with notes",
      mixed: "Needs discussion",
      no: "Do not recommend"
    }
  } as const;

  return map[locale][decision];
}

export function initials(value: string) {
  return value
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
