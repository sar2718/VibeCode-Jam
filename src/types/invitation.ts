import type { CandidateLevel, DomainKey, InvitationStatus, TextValue } from "@/types/common";

export interface InvitationPreview {
  candidateName: string;
  sectionId: string;
  sectionTitle: TextValue;
  roleTemplate: TextValue;
  domain: DomainKey;
  intro: TextValue;
  instructions: TextValue[];
  opensAt: string;
  closesAt: string;
  accessExpiresAt: string;
  durationMinutes: number;
  status: InvitationStatus;
  sessionStartedAt?: string;
  sessionEndsAt?: string;
  selectedLevel?: CandidateLevel;
  canStartNow: boolean;
  canResume: boolean;
}
