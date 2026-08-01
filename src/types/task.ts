import type { CandidateLevel, Difficulty, DomainKey, TextValue } from "@/types/common";

export interface TaskExample {
  input: string;
  output: string;
  explanation: TextValue;
}

export interface Task {
  id: string;
  domain: DomainKey;
  title: TextValue;
  difficulty: Difficulty;
  overview: TextValue;
  statement: TextValue;
  inputFormat: TextValue;
  outputFormat: TextValue;
  constraints: TextValue[];
  examples: TaskExample[];
  hints: TextValue[];
  starterCode: Record<string, string>;
  tags: string[];
  estimatedMinutes: number;
  evaluationFocus: TextValue[];
  recommendedFor: CandidateLevel[];
}
