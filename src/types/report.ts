import type { AntiCheatSignal } from "@/types/result";
import type { RiskLevel, TextValue } from "@/types/common";

export interface ScoreBreakdownItem {
  label: TextValue;
  value: number;
  hint: TextValue;
}

export interface InterviewReport {
  id: string;
  sectionId: string;
  candidateId: string;
  summary: TextValue;
  strengths: TextValue[];
  weaknesses: TextValue[];
  recommendations: TextValue[];
  scoreBreakdown: ScoreBreakdownItem[];
  antiCheatSummary: {
    overallRisk: RiskLevel;
    notes: TextValue;
    signals: AntiCheatSignal[];
  };
  nextSteps: TextValue[];
  createdAt: string;
}
