import { localize } from "@/utils/i18n";
import type { InterviewSettings } from "@/types/interview";

export function buildMockSettings(): InterviewSettings {
  return {
    supportedLanguages: [
      "TypeScript",
      "Python",
      "Java",
      "C++",
      "Go",
      "Rust",
      "SQL"
    ],
    roleTemplates: [
      localize("Алгоритмы", "Algorithms"),
      localize("Алгоритмы + SQL", "Algorithms + SQL")
    ],
    scoreWeights: {
      correctness: 40,
      optimality: 25,
      style: 20,
      communication: 15
    },
    antiCheatModules: [
      {
        key: "clipboard",
        label: localize("Монитор вставок", "Paste monitor"),
        enabled: true,
        threshold: localize("1+ вставка кода", "1+ code paste")
      },
      {
        key: "devtools",
        label: localize("Детектор DevTools", "DevTools detector"),
        enabled: true,
        threshold: localize("Открыто дольше 5 секунд", "Open for more than 5 seconds")
      },
      {
        key: "extensions",
        label: localize("Проверка расширений", "Extension watcher"),
        enabled: true,
        threshold: localize("Известные helper-расширения", "Known helper extensions")
      },
      {
        key: "focus-loss",
        label: localize("Отслеживание ухода из вкладки", "Focus-loss tracker"),
        enabled: true,
        threshold: localize("3+ уходов из вкладки", "3+ focus losses")
      }
    ],
    domains: ["algorithms", "algorithms_sql"],
    adaptivePolicy: {
      entryDifficulty: "medium",
      maxTasksPerSection: 3,
      promoteWhenAttemptsAtMost: 1,
      supportWhenAttemptsAtLeast: 3
    },
    taskBankStats: [
      { domain: "algorithms", count: 3, averageDifficulty: localize("Базовая → продвинутая", "Foundational → advanced") },
      { domain: "algorithms_sql", count: 3, averageDifficulty: localize("Базовая → продвинутая", "Foundational → advanced") }
    ]
  };
}
