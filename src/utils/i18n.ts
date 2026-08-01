import type { LocaleCode, LocalizedText, TextValue } from "@/types/common";

export function localize(ru: string, en: string): LocalizedText {
  return { ru, en };
}

export function textOf(value: TextValue, locale: LocaleCode): string {
  if (typeof value === "string") {
    return value;
  }

  return value[locale] ?? value.ru;
}
