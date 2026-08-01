import { createContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { APP_CONFIG, UI_STORAGE_KEYS } from "@/config/app.config";
import { messages } from "@/i18n/messages";
import type { LocaleCode } from "@/types/common";

interface I18nContextValue {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

function resolvePath(source: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, source);
}

function formatTemplate(template: string, params?: Record<string, string | number>) {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.split(`{{${key}}}`).join(String(value));
  }, template);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(() => {
    if (typeof window === "undefined") {
      return APP_CONFIG.defaultLocale;
    }

    const stored = window.localStorage.getItem(UI_STORAGE_KEYS.locale) as LocaleCode | null;
    return stored === "ru" || stored === "en" ? stored : APP_CONFIG.defaultLocale;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(UI_STORAGE_KEYS.locale, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale(nextLocale) {
        setLocaleState(nextLocale);
      },
      t(path, params) {
        const candidate = resolvePath(messages[locale], path);
        if (typeof candidate === "string") {
          return formatTemplate(candidate, params);
        }

        const fallback = resolvePath(messages[APP_CONFIG.defaultLocale], path);
        if (typeof fallback === "string") {
          return formatTemplate(fallback, params);
        }

        return path;
      }
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
