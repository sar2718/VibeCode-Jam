import type { DomainKey, TextValue } from "@/types/common";

export interface AntiCheatModuleSetting {
  key: string;
  label: TextValue;
  enabled: boolean;
  threshold: TextValue;
}

export interface DomainBankStat {
  domain: DomainKey;
  count: number;
  averageDifficulty: TextValue;
}

export interface InterviewSettings {
  supportedLanguages: string[];
  roleTemplates: TextValue[];
  scoreWeights: {
    correctness: number;
    optimality: number;
    style: number;
    communication: number;
  };
  antiCheatModules: AntiCheatModuleSetting[];
  domains: DomainKey[];
  adaptivePolicy: {
    entryDifficulty: "medium";
    maxTasksPerSection: number;
    promoteWhenAttemptsAtMost: number;
    supportWhenAttemptsAtLeast: number;
  };
  taskBankStats: DomainBankStat[];
}
