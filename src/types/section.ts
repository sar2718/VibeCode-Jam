import type {
  CandidateLevel,
  Difficulty,
  DomainKey,
  InvitationStatus,
  SectionStatus,
  StartWindowMode,
  TextValue
} from "@/types/common";

export interface SectionInvitation {
  hash: string;
  url: string;
  mode: StartWindowMode;
  opensAt: string;
  closesAt: string;
  status: InvitationStatus;
  startWindowDays?: number;
  startedAt?: string;
  completedAt?: string;
  revokedAt?: string;
  lastVisitedAt?: string;
}

export interface SectionRuntime {
  selfAssessmentLevel?: CandidateLevel;
  startedAt?: string;
  sessionEndsAt?: string;
  currentTaskId?: string;
  deliveredTaskIds: string[];
  completedTaskIds: string[];
  adaptiveRound: number;
  canResume: boolean;
  lastSuggestedDifficulty?: Difficulty;
}

export interface SectionTaskPool {
  initialTaskId: string;
  easyTaskIds: string[];
  mediumTaskIds: string[];
  hardTaskIds: string[];
  maxTasks: number;
}

export interface Section {
  id: string;
  candidateId: string;
  title: TextValue;
  domain: DomainKey;
  roleTemplate: TextValue;
  difficultyProfile: "Adaptive" | "Fixed";
  durationMinutes: number;
  status: SectionStatus;
  invitation: SectionInvitation;
  languageOptions: string[];
  taskPool: SectionTaskPool;
  intro: TextValue;
  instructions: TextValue[];
  runtime: SectionRuntime;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
