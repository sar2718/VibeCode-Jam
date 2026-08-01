import type { CandidateLevel, CandidateStatus, DomainKey, RiskLevel, TextValue } from "@/types/common";

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  targetRole: TextValue;
  targetLevel: CandidateLevel;
  inferredLevel?: CandidateLevel;
  preferredDomain: DomainKey;
  timezone: string;
  notes?: TextValue;
  status: CandidateStatus;
  scoreAverage: number;
  antiCheatRisk: RiskLevel;
  createdAt: string;
  lastActivityAt: string;
  sectionIds: string[];
}
