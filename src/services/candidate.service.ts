import { readCollection, writeCollection } from "@/services/storage.service";
import { readInterviewState } from "@/services/interviewState.service";
import { addMinutes } from "@/utils/date";
import { localize } from "@/utils/i18n";
import type { Candidate } from "@/types/candidate";
import type { Difficulty } from "@/types/common";
import type { Section } from "@/types/section";
import type { Task } from "@/types/task";
import type { SectionResult, TaskResultSummary, TestCaseResult } from "@/types/result";
import type { InterviewReport } from "@/types/report";

const delay = (ms = 320) => new Promise((resolve) => setTimeout(resolve, ms));

function ensureCandidate(candidateId: string) {
  const candidates = readCollection<Candidate[]>("candidates");
  const candidate = candidates.find((item) => item.id === candidateId);

  if (!candidate) {
    throw new Error("CANDIDATE_NOT_FOUND");
  }

  return { candidates, candidate };
}

function ensureSection(sectionId: string) {
  const { sections, results } = readInterviewState();
  const section = sections.find((item) => item.id === sectionId);
  const result = results.find((item) => item.sectionId === sectionId);

  if (!section) {
    throw new Error("SECTION_NOT_FOUND");
  }

  if (!result) {
    throw new Error("RESULT_NOT_FOUND");
  }

  return { sections, results, section, result };
}

function getAllSectionTasks(section: Section) {
  const taskIds = [
    ...section.taskPool.easyTaskIds,
    ...section.taskPool.mediumTaskIds,
    ...section.taskPool.hardTaskIds
  ];
  const tasks = readCollection<Task[]>("tasks");
  return tasks.filter((task) => taskIds.includes(task.id));
}

function deliveredTaskIdsOf(section: Section) {
  return Array.isArray(section.runtime.deliveredTaskIds) ? section.runtime.deliveredTaskIds : [];
}

function completedTaskIdsOf(section: Section) {
  return Array.isArray(section.runtime.completedTaskIds) ? section.runtime.completedTaskIds : [];
}

function updateTaskSummary(
  summaries: TaskResultSummary[],
  taskId: string,
  patch: Partial<TaskResultSummary>
) {
  return summaries.map((summary) =>
    summary.taskId === taskId ? { ...summary, ...patch } : summary
  );
}

function buildVisibleTests(summary: TaskResultSummary): TestCaseResult[] {
  const checks: Array<{ name: string; ready: boolean; message: TestCaseResult["message"] }> = [
    {
      name: "Example coverage",
      ready: summary.visibleTestsPassed >= 1,
      message: localize(
        "Базовый пример обработан корректно.",
        "The base example is handled correctly."
      )
    },
    {
      name: "Edge cases",
      ready: summary.visibleTestsPassed >= 2,
      message: localize(
        "Граничные случаи не дают неожиданных падений.",
        "Boundary conditions no longer cause unexpected failures."
      )
    },
    {
      name: "Stability check",
      ready: summary.visibleTestsPassed >= summary.visibleTestsTotal,
      message: localize(
        "Видимые проверки готовы к переходу на следующий шаг.",
        "Visible checks are strong enough to proceed to the next step."
      )
    }
  ];

  return checks.map((check, index) => ({
    name: check.name,
    status:
      check.ready && index < summary.visibleTestsPassed
        ? "passed"
        : index < summary.visibleTestsPassed
          ? "passed"
          : "pending",
    durationMs: check.ready ? 14 + index * 7 : 0,
    visibility: "visible",
    message: check.message
  }));
}

function scoreTaskOutcome(summary: TaskResultSummary, task: Task) {
  const fullyPassed = summary.visibleTestsPassed >= summary.visibleTestsTotal;
  const fastEnough = summary.timeSpentMinutes <= Math.ceil(task.estimatedMinutes * 0.8);

  if (fullyPassed && summary.attempts <= 1 && fastEnough) {
    return "promote" as const;
  }

  if (!fullyPassed || summary.attempts >= 3 || summary.timeSpentMinutes > Math.ceil(task.estimatedMinutes * 1.25)) {
    return "support" as const;
  }

  return "maintain" as const;
}

function difficultyToIndex(difficulty: Difficulty) {
  return difficulty === "easy" ? 0 : difficulty === "medium" ? 1 : 2;
}

function indexToDifficulty(index: number): Difficulty {
  if (index <= 0) {
    return "easy";
  }
  if (index >= 2) {
    return "hard";
  }
  return "medium";
}

function getPoolForDifficulty(section: Section, difficulty: Difficulty) {
  if (difficulty === "easy") {
    return section.taskPool.easyTaskIds;
  }
  if (difficulty === "medium") {
    return section.taskPool.mediumTaskIds;
  }
  return section.taskPool.hardTaskIds;
}

function getFallbackOrder(outcome: "promote" | "maintain" | "support", target: Difficulty) {
  if (outcome === "promote") {
    return [target, "medium", "easy"] as Difficulty[];
  }

  if (outcome === "support") {
    return [target, "medium", "hard"] as Difficulty[];
  }

  return [target, "easy", "hard"] as Difficulty[];
}

function selectNextTask(section: Section, currentTask: Task, summary: TaskResultSummary) {
  const outcome = scoreTaskOutcome(summary, currentTask);
  const currentIndex = difficultyToIndex(currentTask.difficulty);
  const targetIndex =
    outcome === "promote"
      ? currentIndex + 1
      : outcome === "support"
        ? currentIndex - 1
        : currentIndex;
  const targetDifficulty = indexToDifficulty(targetIndex);
  const delivered = new Set(deliveredTaskIdsOf(section));

  for (const difficulty of getFallbackOrder(outcome, targetDifficulty)) {
    const nextTaskId = getPoolForDifficulty(section, difficulty).find((taskId) => !delivered.has(taskId));
    if (nextTaskId) {
      return {
        outcome,
        nextDifficulty: difficulty,
        nextTaskId
      };
    }
  }

  return {
    outcome,
    nextDifficulty: targetDifficulty,
    nextTaskId: undefined
  };
}

function setCandidateStatus(candidateId: string, nextStatus: Candidate["status"]) {
  const candidates = readCollection<Candidate[]>("candidates");
  writeCollection(
    "candidates",
    candidates.map((item) =>
      item.id === candidateId
        ? {
            ...item,
            status: nextStatus,
            lastActivityAt: new Date().toISOString()
          }
        : item
    )
  );
}

export async function getCandidateDashboard(candidateId: string, preferredSectionId?: string) {
  await delay();

  const { candidate } = ensureCandidate(candidateId);
  const { sections, results } = readInterviewState();

  const relatedSections = sections
    .filter((item) => item.candidateId === candidateId)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

  const preferredSection = preferredSectionId
    ? relatedSections.find((item) => item.id === preferredSectionId)
    : undefined;

  const currentSection =
    preferredSection ??
    relatedSections.find((item) => item.status === "in_progress") ??
    relatedSections.find((item) => item.status === "ready") ??
    relatedSections.find((item) => item.status === "scheduled") ??
    relatedSections.find((item) => item.status === "completed") ??
    relatedSections[0];

  return {
    candidate,
    sections: relatedSections,
    currentSection,
    currentResult: currentSection
      ? results.find((item) => item.sectionId === currentSection.id)
      : undefined,
    completedSections: relatedSections.filter((item) => item.status === "completed")
  };
}

export async function getSectionBundle(sectionId: string) {
  await delay();

  const { section, result } = ensureSection(sectionId);
  const { candidate } = ensureCandidate(section.candidateId);
  const tasks = getAllSectionTasks(section);
  const currentTask = tasks.find((item) => item.id === section.runtime.currentTaskId);

  return {
    candidate,
    section,
    tasks,
    currentTask,
    deliveredTasks: tasks.filter((task) => deliveredTaskIdsOf(section).includes(task.id)),
    result,
    readyForNextStep:
      !!currentTask &&
      (() => {
        const summary = result.taskResults.find((item) => item.taskId === currentTask.id);
        return !!summary && (summary.visibleTestsPassed >= summary.visibleTestsTotal || summary.attempts >= 2);
      })()
  };
}

export async function startSection(sectionId: string, level: Section["runtime"]["selfAssessmentLevel"]) {
  await delay(420);

  if (!level) {
    throw new Error("LEVEL_REQUIRED");
  }

  const { sections, results, section, result } = ensureSection(sectionId);

  if (section.status === "completed") {
    throw new Error("SECTION_ALREADY_COMPLETED");
  }

  if (section.status === "revoked") {
    throw new Error("INVITATION_REVOKED");
  }

  if (section.status === "expired") {
    throw new Error("INVITATION_EXPIRED");
  }

  if (section.status !== "ready" && section.status !== "in_progress") {
    throw new Error("INVITATION_NOT_STARTED_YET");
  }

  const startedAt = section.runtime.startedAt ? new Date(section.runtime.startedAt) : new Date();
  const sessionEndsAt = section.runtime.sessionEndsAt
    ? section.runtime.sessionEndsAt
    : addMinutes(startedAt, section.durationMinutes).toISOString();
  const currentTaskId = section.runtime.currentTaskId ?? section.taskPool.initialTaskId;
  const existingDeliveredTaskIds = deliveredTaskIdsOf(section);
  const deliveredTaskIds = existingDeliveredTaskIds.length
    ? existingDeliveredTaskIds
    : [currentTaskId];

  const nextSection: Section = {
    ...section,
    status: "in_progress",
    invitation: {
      ...section.invitation,
      status: "started",
      revokedAt: undefined,
      startedAt: section.invitation.startedAt ?? startedAt.toISOString(),
      lastVisitedAt: new Date().toISOString()
    },
    runtime: {
      ...section.runtime,
      selfAssessmentLevel: level,
      startedAt: startedAt.toISOString(),
      sessionEndsAt,
      currentTaskId,
      deliveredTaskIds,
      adaptiveRound: deliveredTaskIds.length,
      canResume: true,
      lastSuggestedDifficulty: "medium"
    },
    updatedAt: new Date().toISOString()
  };

  const nextResult: SectionResult = {
    ...result,
    selfAssessmentLevel: level,
    currentTaskId,
    finalStatus: "in_progress",
    updatedAt: new Date().toISOString()
  };

  writeCollection(
    "sections",
    sections.map((item) => (item.id === sectionId ? nextSection : item))
  );
  writeCollection(
    "results",
    results.map((item) => (item.id === result.id ? nextResult : item))
  );
  setCandidateStatus(section.candidateId, "active");

  return getSectionBundle(sectionId);
}

export async function saveDraft(
  sectionId: string,
  taskId: string,
  payload: { language: string; code: string }
) {
  await delay(160);

  const { results, result } = ensureSection(sectionId);

  const nextResult: SectionResult = {
    ...result,
    taskResults: updateTaskSummary(result.taskResults, taskId, {
      status: "in_progress",
      language: payload.language,
      codeDraft: payload.code,
      lastRunAt: new Date().toISOString()
    }),
    updatedAt: new Date().toISOString(),
    finalStatus: result.finalStatus === "not_started" ? "in_progress" : result.finalStatus
  };

  writeCollection(
    "results",
    results.map((item) => (item.id === result.id ? nextResult : item))
  );

  return payload;
}

export async function runTests(
  sectionId: string,
  taskId: string,
  payload: { language: string; code: string }
): Promise<{
  visibleTests: TestCaseResult[];
  summary: TaskResultSummary;
  readyForNextStep: boolean;
}> {
  await delay(420);

  const { section, results, result } = ensureSection(sectionId);
  const tasks = getAllSectionTasks(section);
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    throw new Error("SECTION_NOT_FOUND");
  }

  const currentSummary = result.taskResults.find((item) => item.taskId === taskId);
  if (!currentSummary) {
    throw new Error("RESULT_NOT_FOUND");
  }

  const passedVisible = Math.min(currentSummary.visibleTestsTotal, currentSummary.visibleTestsPassed + 1);
  const passedHidden = Math.min(currentSummary.hiddenTestsTotal, currentSummary.hiddenTestsPassed + (passedVisible >= currentSummary.visibleTestsTotal ? 1 : 0));
  const attempts = currentSummary.attempts + 1;
  const timeSpentMinutes = Math.min(task.estimatedMinutes + 10, currentSummary.timeSpentMinutes + 9);

  const summary: TaskResultSummary = {
    ...currentSummary,
    attempts,
    language: payload.language,
    codeDraft: payload.code,
    visibleTestsPassed: passedVisible,
    hiddenTestsPassed: passedHidden,
    timeSpentMinutes,
    lastRunAt: new Date().toISOString(),
    status: passedVisible >= currentSummary.visibleTestsTotal ? "passed" : "in_progress",
    score: Math.round((passedVisible / currentSummary.visibleTestsTotal) * 100)
  };

  const visibleTests = buildVisibleTests(summary);

  const nextResult: SectionResult = {
    ...result,
    taskResults: result.taskResults.map((item) => (item.taskId === taskId ? summary : item)),
    visibleTests,
    attempts: result.attempts + 1,
    visibleTestsPassed: result.visibleTestsPassed + 1,
    visibleTestsTotal: Math.max(result.visibleTestsTotal, summary.visibleTestsTotal),
    hiddenTestsPassed: result.hiddenTestsPassed + (summary.status === "passed" ? 1 : 0),
    hiddenTestsTotal: Math.max(result.hiddenTestsTotal, summary.hiddenTestsTotal),
    timeSpentMinutes,
    updatedAt: new Date().toISOString(),
    finalStatus: "in_progress"
  };

  writeCollection(
    "results",
    results.map((item) => (item.id === result.id ? nextResult : item))
  );

  return {
    visibleTests,
    summary,
    readyForNextStep: summary.visibleTestsPassed >= summary.visibleTestsTotal || summary.attempts >= 2
  };
}

export async function advanceTask(sectionId: string) {
  await delay(320);

  const { sections, results, section, result } = ensureSection(sectionId);
  const tasks = getAllSectionTasks(section);
  const currentTask = tasks.find((item) => item.id === section.runtime.currentTaskId);

  if (!currentTask) {
    throw new Error("NO_NEXT_TASK");
  }

  const currentSummary = result.taskResults.find((item) => item.taskId === currentTask.id);
  if (!currentSummary) {
    throw new Error("RESULT_NOT_FOUND");
  }

  const selection = selectNextTask(section, currentTask, currentSummary);
  const nextDelivered = Array.from(new Set([...deliveredTaskIdsOf(section), currentTask.id]));
  const completedTaskIds = Array.from(new Set([...completedTaskIdsOf(section), currentTask.id]));

  const shouldFinish =
    !selection.nextTaskId || completedTaskIds.length >= section.taskPool.maxTasks;

  const nextSection: Section = {
    ...section,
    runtime: {
      ...section.runtime,
      currentTaskId: shouldFinish ? undefined : selection.nextTaskId,
      deliveredTaskIds: shouldFinish
        ? nextDelivered
        : Array.from(new Set([...nextDelivered, selection.nextTaskId ?? ""])).filter(Boolean),
      completedTaskIds,
      adaptiveRound: completedTaskIds.length,
      lastSuggestedDifficulty: selection.nextDifficulty
    },
    updatedAt: new Date().toISOString()
  };

  const nextResult: SectionResult = {
    ...result,
    currentTaskId: shouldFinish ? undefined : selection.nextTaskId,
    taskResults: updateTaskSummary(result.taskResults, currentTask.id, {
      status:
        currentSummary.visibleTestsPassed >= currentSummary.visibleTestsTotal
          ? "passed"
          : currentSummary.attempts >= 2
            ? "failed"
            : currentSummary.status
    }),
    adaptiveDecisions: [
      ...result.adaptiveDecisions,
      {
        taskId: currentTask.id,
        difficulty: currentTask.difficulty,
        outcome: selection.outcome,
        nextTaskId: selection.nextTaskId,
        nextDifficulty: selection.nextDifficulty,
        reason:
          selection.outcome === "promote"
            ? localize(
                "Текущая задача решена достаточно быстро и с хорошим покрытием видимых тестов.",
                "The current task was solved quickly enough with strong visible-test coverage."
              )
            : selection.outcome === "support"
              ? localize(
                  "Кандидату нужен более поддерживающий следующий шаг после текущего темпа и числа попыток.",
                  "The candidate needs a more supportive next step based on the current pace and number of attempts."
                )
              : localize(
                  "Система сохраняет тот же уровень сложности и даёт задачу на закрепление.",
                  "The system keeps the same difficulty and gives a reinforcing follow-up task."
                ),
        decidedAt: new Date().toISOString()
      }
    ],
    adaptiveInsight:
      selection.outcome === "promote"
        ? localize(
            "Следующий шаг повышает сложность внутри секции.",
            "The next step raises the difficulty inside the section."
          )
        : selection.outcome === "support"
          ? localize(
              "Следующий шаг будет проще или более поддерживающим.",
              "The next step will be easier or more supportive."
            )
          : localize(
              "Следующий шаг сохраняет текущий уровень сложности.",
              "The next step keeps the current difficulty level."
            ),
    updatedAt: new Date().toISOString()
  };

  writeCollection(
    "sections",
    sections.map((item) => (item.id === section.id ? nextSection : item))
  );
  writeCollection(
    "results",
    results.map((item) => (item.id === result.id ? nextResult : item))
  );

  return {
    nextTaskId: selection.nextTaskId,
    shouldFinish,
    outcome: selection.outcome,
    difficulty: selection.nextDifficulty
  };
}


function buildReport(section: Section, result: SectionResult): InterviewReport {
  const score = Math.max(0, Math.min(100, 55 + result.visibleTestsPassed * 8 + (section.runtime.completedTaskIds?.length ?? 0) * 7 - result.errors * 3));
  const overallRisk = result.antiCheatSignals.some((signal) => signal.level === "high")
    ? "high"
    : result.antiCheatSignals.some((signal) => signal.level === "medium")
      ? "medium"
      : "low";

  return {
    id: `rep-${section.id}`,
    sectionId: section.id,
    candidateId: section.candidateId,
    summary: localize(
      "Интервью завершено. Система сохранила решение, адаптивные шаги и видимые результаты прогонов для последующей проверки.",
      "The interview has been completed. The system saved the solution, adaptive steps and visible run results for review."
    ),
    strengths: [
      localize("Поддерживает рабочий темп и доводит задачу до отправки.", "Keeps a workable pace and drives tasks to submission."),
      localize("Покрывает видимые проверки и сохраняет состояние решения.", "Covers visible checks and preserves solution state.")
    ],
    weaknesses: [
      localize("Есть пространство для улучшения скорости и глубины аргументации.", "There is room to improve pace and depth of reasoning.")
    ],
    recommendations: [
      localize("Сверить решение с архитектурными и производственными компромиссами на следующем этапе.", "Review architecture and production trade-offs in the next stage.")
    ],
    scoreBreakdown: [
      { label: localize("Корректность", "Correctness"), value: Math.min(100, score), hint: localize("Прохождение проверок и корректность ответа.", "Checks coverage and solution correctness.") },
      { label: localize("Оптимальность", "Optimality"), value: Math.max(60, Math.min(100, score - 4)), hint: localize("Структура решения и сложность.", "Solution structure and complexity." ) },
      { label: localize("Стиль", "Style"), value: Math.max(58, Math.min(100, score - 6)), hint: localize("Читаемость и аккуратность кода.", "Readability and code hygiene.") },
      { label: localize("Коммуникация", "Communication"), value: Math.max(55, Math.min(100, score - 2)), hint: localize("Ясность объяснения подхода.", "Clarity of reasoning and explanation.") }
    ],
    antiCheatSummary: {
      overallRisk,
      notes: localize(
        "Итоговый риск сформирован на основе системных сигналов и поведения во время интервью.",
        "The overall risk is based on system signals and interview behavior."
      ),
      signals: result.antiCheatSignals
    },
    nextSteps: [
      localize("Открыть отчёт в административной панели и сверить результат с профилем вакансии.", "Open the report in the admin panel and compare it with the role profile.")
    ],
    createdAt: new Date().toISOString()
  };
}

export async function submitSection(sectionId: string) {
  await delay(380);

  const { sections, results, section, result } = ensureSection(sectionId);
  if (section.status === "completed") {
    return { section, result };
  }

  const completedAt = new Date().toISOString();
  const nextSection: Section = {
    ...section,
    status: "completed",
    completedAt,
    invitation: {
      ...section.invitation,
      status: "completed",
      completedAt
    },
    runtime: {
      ...section.runtime,
      canResume: false,
      currentTaskId: undefined,
      completedTaskIds: Array.from(new Set([...completedTaskIdsOf(section), ...(section.runtime.currentTaskId ? [section.runtime.currentTaskId] : [])]))
    },
    updatedAt: completedAt
  };

  const totalVisible = result.taskResults.reduce((sum, item) => sum + item.visibleTestsTotal, 0);
  const passedVisible = result.taskResults.reduce((sum, item) => sum + item.visibleTestsPassed, 0);
  const overallScore = totalVisible ? Math.round((passedVisible / totalVisible) * 100) : 0;

  const nextResult: SectionResult = {
    ...result,
    overallScore,
    correctness: overallScore,
    optimality: Math.max(55, overallScore - 4),
    codeStyle: Math.max(55, overallScore - 6),
    communication: Math.max(55, overallScore - 2),
    finalStatus: result.finalStatus === "reviewed" ? "reviewed" : "submitted",
    currentTaskId: undefined,
    updatedAt: completedAt
  };

  writeCollection(
    "sections",
    sections.map((item) => (item.id === section.id ? nextSection : item))
  );
  writeCollection(
    "results",
    results.map((item) => (item.id === result.id ? nextResult : item))
  );

  const reports = readCollection<InterviewReport[]>("reports");
  const report = buildReport(nextSection, nextResult);
  writeCollection(
    "reports",
    [report, ...reports.filter((item) => item.sectionId !== section.id)]
  );

  setCandidateStatus(section.candidateId, "completed");

  return {
    section: nextSection,
    result: nextResult
  };
}
