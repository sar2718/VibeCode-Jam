import type { CandidateStatus, DomainKey, SectionStatus } from "@/types/common";

export const DOMAIN_OPTIONS: DomainKey[] = ["algorithms", "algorithms_sql"];

export const CANDIDATE_FILTER_STATUSES: CandidateStatus[] = ["invited", "ready", "active", "completed"];

export type InterviewFilterStatus = "ready" | "in_progress" | "completed" | "blocked";

export const INTERVIEW_FILTER_STATUSES: InterviewFilterStatus[] = ["ready", "in_progress", "completed", "blocked"];

export function getInterviewFilterStatus(status: SectionStatus): InterviewFilterStatus {
  if (status === "in_progress") return "in_progress";
  if (status === "completed") return "completed";
  if (status === "revoked" || status === "expired") return "blocked";
  return "ready";
}
