export type UserRole = "candidate" | "admin";
export type Difficulty = "easy" | "medium" | "hard";
export type RiskLevel = "low" | "medium" | "high";
export type CandidateStatus = "invited" | "ready" | "active" | "completed" | "paused";
export type SectionStatus =
  | "draft"
  | "scheduled"
  | "ready"
  | "in_progress"
  | "completed"
  | "expired"
  | "revoked";
export type AsyncViewState = "idle" | "loading" | "success" | "error";
export type LocaleCode = "ru" | "en";
export type ThemeMode = "light" | "dark";
export type CandidateLevel = "intern" | "junior" | "middle" | "senior" | "lead";
export type DomainKey = "algorithms" | "algorithms_sql" | "backend" | "frontend" | "system_design" | "mobile" | "data" | "devops" | "qa";
export type InvitationStatus =
  | "scheduled"
  | "available"
  | "started"
  | "completed"
  | "expired"
  | "revoked";
export type StartWindowMode = "relative_days" | "fixed_range";
export type AdaptiveOutcome = "promote" | "maintain" | "support";
export type TextValue = string | LocalizedText;

export interface LocalizedText {
  ru: string;
  en: string;
}
