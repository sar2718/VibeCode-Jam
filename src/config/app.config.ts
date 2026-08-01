import type { DomainKey, LocaleCode, ThemeMode, UserRole } from "@/types/common";

export const APP_CONFIG = {
  appName: "Interviewer OS",
  appTagline: "Technical interview workspace",
  supportEmail: "product-ui@interviewer-os.local",
  useMockApi: true,
  defaultLocale: "ru" as LocaleCode,
  defaultTheme: "dark" as ThemeMode,
  roles: ["candidate", "admin"] as UserRole[],
  demoCredentials: {
    candidate: { login: "demo", password: "demo123" },
    admin: { login: "admin", password: "admin" }
  }
};

export const DOMAIN_LANGUAGE_PRESETS: Partial<Record<DomainKey, string[]>> = {
  algorithms: ["TypeScript", "Python", "Java", "C++", "Go", "Rust"],
  algorithms_sql: ["Python", "Java", "TypeScript", "SQL"]
};

export const STORAGE_KEYS = {
  authSession: "ai-interview.auth-session",
  candidates: "ai-interview.candidates",
  sections: "ai-interview.sections",
  tasks: "ai-interview.tasks",
  results: "ai-interview.results",
  reports: "ai-interview.reports",
  settings: "ai-interview.settings"
} as const;

export const UI_STORAGE_KEYS = {
  locale: "ai-interview.locale",
  theme: "ai-interview.theme"
} as const;
