import { createContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { APP_CONFIG, UI_STORAGE_KEYS } from "@/config/app.config";
import type { ThemeMode } from "@/types/common";

interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return APP_CONFIG.defaultTheme;
    }

    const stored = window.localStorage.getItem(UI_STORAGE_KEYS.theme) as ThemeMode | null;
    return stored === "light" || stored === "dark" ? stored : APP_CONFIG.defaultTheme;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    applyTheme(theme);
    window.localStorage.setItem(UI_STORAGE_KEYS.theme, theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme() {
        setThemeState((current) => (current === "dark" ? "light" : "dark"));
      },
      setTheme(nextTheme) {
        setThemeState(nextTheme);
      }
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
