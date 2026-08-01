import type { AdaptiveOutcome, CandidateLevel, Difficulty, RiskLevel, TextValue } from "@/types/common";

export interface TestCaseResult {
  name: string;
  status: "passed" | "failed" | "pending";
  durationMs: number;
  visibility: "visible" | "hidden";
  message: TextValue;
}

export interface TaskResultSummary {
  taskId: string;
  status: "not_started" | "in_progress" | "passed" | "failed";
  attempts: number;
  timeSpentMinutes: number;
  visibleTestsPassed: number;
  visibleTestsTotal: number;
  hiddenTestsPassed: number;
  hiddenTestsTotal: number;
  language: string;
  lastRunAt?: string;
  codeDraft?: string;
  score?: number;
}

export interface CodeQualityMetrics {
  readability: number;
  complexity: number;
  optimality: number;
  style: number;
  communication: number;
}

export interface AntiCheatSignal {
  key: string;
  label: TextValue;
  level: RiskLevel;
  value: string;
  description: TextValue;
}

export interface AdaptiveDecision {
  taskId: string;
  difficulty: Difficulty;
  outcome: AdaptiveOutcome;
  nextTaskId?: string;
  nextDifficulty?: Difficulty;
  reason: TextValue;
  decidedAt: string;
}

export interface SectionResult {
  id: string;
  sectionId: string;
  candidateId: string;
  overallScore: number;
  correctness: number;
  optimality: number;
  codeStyle: number;
  communication: number;
  attempts: number;
  errors: number;
  timeSpentMinutes: number;
  hiddenTestsPassed: number;
  hiddenTestsTotal: number;
  visibleTestsPassed: number;
  visibleTestsTotal: number;
  taskResults: TaskResultSummary[];
  codeQuality: CodeQualityMetrics;
  antiCheatSignals: AntiCheatSignal[];
  visibleTests: TestCaseResult[];
  strengths: TextValue[];
  weaknesses: TextValue[];
  decision: "strong_yes" | "yes" | "mixed" | "no";
  adaptiveInsight: TextValue;
  adaptiveDecisions: AdaptiveDecision[];
  selfAssessmentLevel?: CandidateLevel;
  currentTaskId?: string;
  finalStatus: "not_started" | "in_progress" | "submitted" | "reviewed";
  updatedAt: string;
}
