import { DOMAIN_LANGUAGE_PRESETS } from "@/config/app.config";
import { addDays } from "@/utils/date";
import { formatDateTime } from "@/utils/format";
import { localize, textOf } from "@/utils/i18n";
import { readCollection, writeCollection } from "@/services/storage.service";
import { readInterviewState } from "@/services/interviewState.service";
import type { Candidate } from "@/types/candidate";
import type { DomainKey, LocaleCode, RiskLevel, StartWindowMode } from "@/types/common";
import type { InterviewSettings } from "@/types/interview";
import type { InterviewReport } from "@/types/report";
import type { SectionResult } from "@/types/result";
import type { Section, SectionTaskPool } from "@/types/section";
import type { Task } from "@/types/task";

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

interface CreateCandidateInput {
  fullName: string;
  email: string;
  preferredDomain: DomainKey;
  timezone?: string;
  notes?: string;
}

interface UpdateCandidateInput {
  fullName: string;
  email: string;
  targetRole: string;
  targetLevel: Candidate["targetLevel"];
  preferredDomain: DomainKey;
  timezone?: string;
  notes?: string;
}

interface CreateSectionInput {
  candidateId?: string;
  candidate?: {
    fullName: string;
    email: string;
    timezone?: string;
    notes?: string;
  };
  title: string;
  domain: DomainKey;
  roleTemplate: string;
  startWindowMode: StartWindowMode;
  startWindowDays?: number;
  startWindowStart?: string;
  startWindowEnd?: string;
  durationMinutes: number;
  languageOptions: string[];
  intro: string;
  instructions: string[];
}

export type ReportExportFormat = "txt" | "md" | "json" | "html";

function buildInvitationUrl(hash: string) {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/invite/${hash}`;
  }

  return `https://demo.local/invite/${hash}`;
}

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeRoleForCandidate(domain: DomainKey, roleTemplate: string) {
  return (
    roleTemplate.trim() ||
    {
      algorithms: "Алгоритмы",
      algorithms_sql: "Алгоритмы + SQL",
      backend: "Backend-разработчик",
      frontend: "Frontend-разработчик",
      system_design: "System Design",
      mobile: "Mobile-разработчик",
      data: "Data engineer",
      devops: "DevOps engineer",
      qa: "QA engineer"
    }[domain]
  );
}

function resolveRiskBySignals(signals: SectionResult["antiCheatSignals"]): RiskLevel {
  if (signals.some((signal) => signal.level === "high")) {
    return "high";
  }
  if (signals.some((signal) => signal.level === "medium")) {
    return "medium";
  }
  return "low";
}

function scoreToCandidateLevel(score: number): Candidate["targetLevel"] {
  if (score >= 88) return "lead";
  if (score >= 76) return "senior";
  if (score >= 64) return "middle";
  if (score >= 50) return "junior";
  return "intern";
}

function inferLevelFromResults(results: SectionResult[]): Candidate["targetLevel"] | undefined {
  if (!results.length) {
    return undefined;
  }

  const adjusted = results.map((result) => {
    const metricsAverage = Math.round(
      (result.correctness + result.optimality + result.codeStyle + result.communication) / 4
    );
    const baseScore = result.overallScore > 0 ? result.overallScore : metricsAverage;
    const decisionBoost: Record<SectionResult["decision"], number> = {
      strong_yes: 6,
      yes: 3,
      mixed: 0,
      no: -6
    };
    const riskPenalty: Record<RiskLevel, number> = { low: 0, medium: 4, high: 8 };
    const value = Math.max(
      0,
      Math.min(100, baseScore + decisionBoost[result.decision] - riskPenalty[resolveRiskBySignals(result.antiCheatSignals)])
    );
    return value;
  });

  const averageAdjustedScore = adjusted.reduce((sum, value) => sum + value, 0) / adjusted.length;
  return scoreToCandidateLevel(averageAdjustedScore);
}

function pickTaskPool(domain: DomainKey, tasks: Task[], maxTasks: number): SectionTaskPool {
  const domainTasks = tasks.filter((task) => task.domain === domain);
  const easyTaskIds = domainTasks.filter((task) => task.difficulty === "easy").map((task) => task.id);
  const mediumTaskIds = domainTasks.filter((task) => task.difficulty === "medium").map((task) => task.id);
  const hardTaskIds = domainTasks.filter((task) => task.difficulty === "hard").map((task) => task.id);

  if (!mediumTaskIds.length || !easyTaskIds.length || !hardTaskIds.length) {
    throw new Error("ROLE_REQUIRED");
  }

  return {
    initialTaskId: mediumTaskIds[0],
    easyTaskIds: easyTaskIds.slice(0, maxTasks),
    mediumTaskIds: mediumTaskIds.slice(0, maxTasks),
    hardTaskIds: hardTaskIds.slice(0, maxTasks),
    maxTasks
  };
}

function buildInitialResult(sectionId: string, candidateId: string, taskPool: SectionTaskPool): SectionResult {
  const taskIds = [...taskPool.easyTaskIds, ...taskPool.mediumTaskIds, ...taskPool.hardTaskIds];

  return {
    id: generateId("res"),
    sectionId,
    candidateId,
    overallScore: 0,
    correctness: 0,
    optimality: 0,
    codeStyle: 0,
    communication: 0,
    attempts: 0,
    errors: 0,
    timeSpentMinutes: 0,
    hiddenTestsPassed: 0,
    hiddenTestsTotal: 0,
    visibleTestsPassed: 0,
    visibleTestsTotal: 0,
    taskResults: taskIds.map((taskId, index) => ({
      taskId,
      status: "not_started",
      attempts: 0,
      timeSpentMinutes: 0,
      visibleTestsPassed: 0,
      visibleTestsTotal: index % 2 === 0 ? 2 : 3,
      hiddenTestsPassed: 0,
      hiddenTestsTotal: index % 2 === 0 ? 2 : 3,
      language: "TypeScript"
    })),
    codeQuality: {
      readability: 0,
      complexity: 0,
      optimality: 0,
      style: 0,
      communication: 0
    },
    antiCheatSignals: [],
    visibleTests: [],
    strengths: [],
    weaknesses: [],
    decision: "mixed",
    adaptiveInsight: "",
    adaptiveDecisions: [],
    finalStatus: "not_started",
    updatedAt: new Date().toISOString()
  };
}

function ensureOrCreateCandidate(input: CreateSectionInput, candidates: Candidate[]) {
  if (input.candidateId) {
    const candidate = candidates.find((item) => item.id === input.candidateId);
    if (!candidate) {
      throw new Error("CANDIDATE_NOT_FOUND");
    }
    return { candidate, candidates };
  }

  if (!input.candidate?.fullName.trim()) {
    throw new Error("CANDIDATE_REQUIRED");
  }

  const candidate: Candidate = {
    id: generateId("cand"),
    fullName: input.candidate.fullName.trim(),
    email: input.candidate.email.trim(),
    targetRole: normalizeRoleForCandidate(input.domain, input.roleTemplate),
    targetLevel: "middle",
    preferredDomain: input.domain,
    timezone: input.candidate.timezone?.trim() || "UTC",
    notes: input.candidate.notes?.trim(),
    status: "invited",
    scoreAverage: 0,
    antiCheatRisk: "low",
    createdAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    sectionIds: []
  };

  return { candidate, candidates: [candidate, ...candidates] };
}



function buildFallbackReport(section: Section, result: SectionResult): InterviewReport {
  const score = result.overallScore || 0;
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
      "Интервью завершено. Система сохранила решение и результаты проверок для административного просмотра.",
      "The interview has been completed. The system saved the solution and test results for administrative review."
    ),
    strengths: [],
    weaknesses: [],
    recommendations: [],
    scoreBreakdown: [
      { label: localize("Корректность", "Correctness"), value: result.correctness || score, hint: localize("Прохождение проверок.", "Checks coverage.") },
      { label: localize("Оптимальность", "Optimality"), value: result.optimality || Math.max(60, score - 4), hint: localize("Структура решения.", "Solution structure.") },
      { label: localize("Стиль", "Style"), value: result.codeStyle || Math.max(58, score - 6), hint: localize("Читаемость и аккуратность.", "Readability and hygiene.") },
      { label: localize("Коммуникация", "Communication"), value: result.communication || Math.max(55, score - 2), hint: localize("Объяснение подхода.", "Reasoning and explanation.") }
    ],
    antiCheatSummary: {
      overallRisk,
      notes: localize(
        "Итоговый риск сформирован на основе системных сигналов и поведения во время интервью.",
        "The overall risk is based on system signals and interview behavior."
      ),
      signals: result.antiCheatSignals
    },
    nextSteps: [],
    createdAt: result.updatedAt || new Date().toISOString()
  };
}

function ensureCandidate(candidateId: string) {
  const candidates = readCollection<Candidate[]>("candidates");
  const candidate = candidates.find((item) => item.id === candidateId);
  if (!candidate) {
    throw new Error("CANDIDATE_NOT_FOUND");
  }
  return { candidates, candidate };
}

export function getDomainLanguages(domain: DomainKey) {
  return DOMAIN_LANGUAGE_PRESETS[domain] ?? ["TypeScript"];
}

export async function getCandidates() {
  await delay(160);

  const candidates = readCollection<Candidate[]>("candidates");
  const { results } = readInterviewState();

  return candidates
    .map((candidate) => {
      const completedResults = results.filter(
        (result) =>
          result.candidateId === candidate.id &&
          (result.finalStatus === "submitted" || result.finalStatus === "reviewed")
      );

      if (!completedResults.length) {
        return {
          ...candidate,
          inferredLevel: undefined
        };
      }

      const averageScore = Math.round(
        completedResults.reduce((sum, result) => sum + result.overallScore, 0) / completedResults.length
      );
      const risk: RiskLevel = completedResults.some((result) => resolveRiskBySignals(result.antiCheatSignals) === "high")
        ? "high"
        : completedResults.some((result) => resolveRiskBySignals(result.antiCheatSignals) === "medium")
          ? "medium"
          : "low";

      return {
        ...candidate,
        scoreAverage: averageScore,
        antiCheatRisk: risk,
        inferredLevel: inferLevelFromResults(completedResults)
      };
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export async function getCandidateById(candidateId: string) {
  await delay();

  const candidates = readCollection<Candidate[]>("candidates");
  const { sections, results } = readInterviewState();
  const reports = readCollection<InterviewReport[]>("reports");

  const candidate = candidates.find((item) => item.id === candidateId);
  if (!candidate) {
    throw new Error("CANDIDATE_NOT_FOUND");
  }

  return {
    candidate,
    sections: sections.filter((item) => item.candidateId === candidateId),
    results: results.filter((item) => item.candidateId === candidateId),
    reports: reports.filter((item) => item.candidateId === candidateId)
  };
}

export async function createCandidate(input: CreateCandidateInput) {
  await delay(260);

  const candidates = readCollection<Candidate[]>("candidates");
  const candidate: Candidate = {
    id: generateId("cand"),
    fullName: input.fullName,
    email: input.email,
    targetRole: normalizeRoleForCandidate(input.preferredDomain, ""),
    targetLevel: "middle",
    preferredDomain: input.preferredDomain,
    timezone: input.timezone ?? "UTC",
    notes: input.notes,
    status: "invited",
    scoreAverage: 0,
    antiCheatRisk: "low",
    createdAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    sectionIds: []
  };

  writeCollection("candidates", [candidate, ...candidates]);
  return candidate;
}

export async function updateCandidate(candidateId: string, input: UpdateCandidateInput) {
  await delay(220);

  const { candidates, candidate } = ensureCandidate(candidateId);

  const nextCandidate: Candidate = {
    ...candidate,
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    targetRole: input.targetRole.trim(),
    targetLevel: input.targetLevel,
    preferredDomain: input.preferredDomain,
    timezone: input.timezone?.trim() || candidate.timezone || "UTC",
    notes: input.notes?.trim(),
    lastActivityAt: new Date().toISOString()
  };

  writeCollection(
    "candidates",
    candidates.map((item) => (item.id === candidateId ? nextCandidate : item))
  );

  return nextCandidate;
}

export async function deleteCandidate(candidateId: string) {
  await delay(220);

  const candidates = readCollection<Candidate[]>("candidates");
  const sections = readCollection<Section[]>("sections");
  const results = readCollection<SectionResult[]>("results");
  const reports = readCollection<InterviewReport[]>("reports");

  writeCollection("candidates", candidates.filter((item) => item.id !== candidateId));
  writeCollection("sections", sections.filter((item) => item.candidateId !== candidateId));
  writeCollection("results", results.filter((item) => item.candidateId !== candidateId));
  writeCollection("reports", reports.filter((item) => item.candidateId !== candidateId));

  return true;
}

export async function getSections() {
  await delay(180);

  const { sections } = readInterviewState();
  const candidates = readCollection<Candidate[]>("candidates");

  return sections.map((section) => {
    const isRevoked = Boolean(section.invitation.revokedAt) || section.status === "revoked" || section.invitation.status === "revoked";

    return {
      ...section,
      status: isRevoked ? "revoked" : section.status,
      invitation: {
        ...section.invitation,
        status: isRevoked ? "revoked" : section.invitation.status
      },
      candidateName: candidates.find((candidate) => candidate.id === section.candidateId)?.fullName ?? "Unknown"
    };
  });
}

export async function createSection(input: CreateSectionInput) {
  await delay(420);

  if (!input.title.trim()) {
    throw new Error("TITLE_REQUIRED");
  }
  if (!input.roleTemplate.trim()) {
    throw new Error("ROLE_REQUIRED");
  }

  const existingCandidates = readCollection<Candidate[]>("candidates");
  const { candidate, candidates } = ensureOrCreateCandidate(input, existingCandidates);
  const settings = readCollection<InterviewSettings>("settings");
  const tasks = readCollection<Task[]>("tasks");
  const sections = readCollection<Section[]>("sections");
  const results = readCollection<SectionResult[]>("results");

  const taskPool = pickTaskPool(input.domain, tasks, settings.adaptivePolicy.maxTasksPerSection);
  const invitationHash = generateId("INV").toUpperCase();
  const now = new Date();
  const opensAt = input.startWindowMode === "relative_days" ? now.toISOString() : input.startWindowStart ?? now.toISOString();
  const closesAt = input.startWindowMode === "relative_days" ? addDays(now, input.startWindowDays ?? 7).toISOString() : input.startWindowEnd;

  if (!closesAt) {
    throw new Error("WINDOW_REQUIRED");
  }

  const initialStatus = Date.parse(opensAt) > Date.now() ? "scheduled" : "ready";
  const sectionId = generateId("sec");
  const interview: Section = {
    id: sectionId,
    candidateId: candidate.id,
    title: input.title,
    domain: input.domain,
    roleTemplate: input.roleTemplate,
    difficultyProfile: "Adaptive",
    durationMinutes: input.durationMinutes,
    status: initialStatus,
    invitation: {
      hash: invitationHash,
      url: buildInvitationUrl(invitationHash),
      mode: input.startWindowMode,
      opensAt,
      closesAt,
      status: initialStatus === "scheduled" ? "scheduled" : "available",
      startWindowDays: input.startWindowMode === "relative_days" ? input.startWindowDays ?? 7 : undefined
    },
    languageOptions: input.languageOptions.length ? input.languageOptions : getDomainLanguages(input.domain),
    taskPool,
    intro: input.intro,
    instructions: input.instructions,
    runtime: {
      deliveredTaskIds: [],
      completedTaskIds: [],
      adaptiveRound: 0,
      canResume: false
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const result = buildInitialResult(sectionId, candidate.id, taskPool);

  writeCollection("sections", [interview, ...sections]);
  writeCollection("results", [result, ...results]);
  writeCollection(
    "candidates",
    candidates.map((item) =>
      item.id === candidate.id
        ? {
            ...item,
            targetRole: normalizeRoleForCandidate(input.domain, input.roleTemplate),
            preferredDomain: input.domain,
            status: "ready",
            sectionIds: [sectionId, ...item.sectionIds],
            lastActivityAt: new Date().toISOString()
          }
        : item
    )
  );

  return interview;
}

export async function deleteSection(sectionId: string) {
  await delay(220);

  const sections = readCollection<Section[]>("sections");
  const section = sections.find((item) => item.id === sectionId);
  if (!section) {
    throw new Error("SECTION_NOT_FOUND");
  }

  const candidates = readCollection<Candidate[]>("candidates");
  const results = readCollection<SectionResult[]>("results");
  const reports = readCollection<InterviewReport[]>("reports");

  writeCollection("sections", sections.filter((item) => item.id !== sectionId));
  writeCollection("results", results.filter((item) => item.sectionId !== sectionId));
  writeCollection("reports", reports.filter((item) => item.sectionId !== sectionId));
  writeCollection(
    "candidates",
    candidates.map((item) =>
      item.id === section.candidateId
        ? { ...item, sectionIds: item.sectionIds.filter((id) => id !== sectionId), lastActivityAt: new Date().toISOString() }
        : item
    )
  );

  return true;
}

function resolveSectionAvailability(section: Section, now = Date.now()) {
  const opensAtMs = Date.parse(section.invitation.opensAt);
  const closesAtMs = Date.parse(section.invitation.closesAt);
  const sessionEndsAtMs = section.runtime.sessionEndsAt ? Date.parse(section.runtime.sessionEndsAt) : null;

  if (section.invitation.revokedAt) {
    return {
      status: "revoked" as Section["status"],
      invitationStatus: "revoked" as Section["invitation"]["status"],
      canResume: false
    };
  }

  if (section.runtime.startedAt && sessionEndsAtMs && now < sessionEndsAtMs) {
    return {
      status: "in_progress" as Section["status"],
      invitationStatus: "started" as Section["invitation"]["status"],
      canResume: true
    };
  }

  if (section.runtime.startedAt && sessionEndsAtMs && now >= sessionEndsAtMs) {
    return {
      status: "completed" as Section["status"],
      invitationStatus: "completed" as Section["invitation"]["status"],
      canResume: false
    };
  }

  if (closesAtMs < now) {
    return {
      status: "expired" as Section["status"],
      invitationStatus: "expired" as Section["invitation"]["status"],
      canResume: false
    };
  }

  if (opensAtMs > now) {
    return {
      status: "scheduled" as Section["status"],
      invitationStatus: "scheduled" as Section["invitation"]["status"],
      canResume: false
    };
  }

  return {
    status: "ready" as Section["status"],
    invitationStatus: "available" as Section["invitation"]["status"],
    canResume: false
  };
}

export async function setInvitationActive(sectionId: string, invitationHash: string, active: boolean) {
  await delay(180);

  const { sections } = readInterviewState();
  const targetIndex = sections.findIndex((section) => section.invitation.hash === invitationHash);

  if (targetIndex < 0) {
    throw new Error("SECTION_NOT_FOUND");
  }

  const target = sections[targetIndex];
  if (target.id !== sectionId) {
    throw new Error("SECTION_NOT_FOUND");
  }

  if (target.status === "completed") {
    return target;
  }

  const nextSections = [...sections];

  if (!active) {
    nextSections[targetIndex] = {
      ...target,
      status: "revoked",
      invitation: {
        ...target.invitation,
        status: "revoked",
        revokedAt: new Date().toISOString()
      },
      runtime: {
        ...target.runtime,
        canResume: false
      },
      updatedAt: new Date().toISOString()
    };
  } else {
    const restored = {
      ...target,
      invitation: {
        ...target.invitation,
        revokedAt: undefined,
        completedAt: target.invitation.completedAt
      }
    };
    const availability = resolveSectionAvailability(restored);
    nextSections[targetIndex] = {
      ...restored,
      status: availability.status,
      invitation: {
        ...restored.invitation,
        status: availability.invitationStatus,
        revokedAt: undefined
      },
      runtime: {
        ...restored.runtime,
        canResume: availability.canResume
      },
      updatedAt: new Date().toISOString()
    };
  }

  writeCollection("sections", nextSections);
  return nextSections[targetIndex];
}

export async function getResults() {
  await delay(180);

  const { results, sections } = readInterviewState();
  const candidates = readCollection<Candidate[]>("candidates");

  return results
    .filter((result) => result.finalStatus === "submitted" || result.finalStatus === "reviewed")
    .map((result) => {
      const candidate = candidates.find((item) => item.id === result.candidateId);
      const section = sections.find((item) => item.id === result.sectionId);

      return {
        ...result,
        candidateName: candidate?.fullName ?? "Unknown",
        sectionTitle: section?.title ?? "Unknown",
        sectionDomain: section?.domain ?? "frontend"
      };
    })
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function getReportBySectionId(sectionId: string) {
  await delay(180);

  const { sections, results } = readInterviewState();
  const section = sections.find((item) => item.id === sectionId);
  const result = results.find((item) => item.sectionId === sectionId);

  if (!section) {
    throw new Error("SECTION_NOT_FOUND");
  }

  if (!result) {
    throw new Error("RESULT_NOT_FOUND");
  }

  const reports = readCollection<InterviewReport[]>("reports");
  let report = reports.find((item) => item.sectionId === sectionId);

  if (!report) {
    report = buildFallbackReport(section, result);
    writeCollection("reports", [report, ...reports.filter((item) => item.sectionId !== sectionId)]);
  }

  const candidate = readCollection<Candidate[]>("candidates").find((item) => item.id === report.candidateId);

  return {
    report,
    result,
    section,
    candidate
  };
}

export async function exportReport(sectionId: string, locale: LocaleCode, format: ReportExportFormat = "txt") {
  await delay(120);

  const { report, candidate, section } = await getReportBySectionId(sectionId);
  const title = typeof section?.title === "string" ? section.title : textOf(section?.title ?? { ru: "", en: "" }, locale);
  const candidateName = candidate?.fullName ?? "Unknown";
  const createdAt = formatDateTime(report.createdAt, locale);
  const summary = textOf(report.summary, locale);
  const strengths = report.strengths.map((item) => textOf(item, locale));
  const weaknesses = report.weaknesses.map((item) => textOf(item, locale));
  const recommendations = report.recommendations.map((item) => textOf(item, locale));

  const baseName = `${candidateName}-${sectionId}-report`.replace(/\s+/g, "-").toLowerCase();

  if (format === "json") {
    return {
      filename: `${baseName}.json`,
      content: JSON.stringify({ candidateName, title, createdAt, summary, strengths, weaknesses, recommendations }, null, 2),
      mimeType: "application/json"
    };
  }

  if (format === "md") {
    return {
      filename: `${baseName}.md`,
      content: `# ${title}\n\n- Candidate: ${candidateName}\n- Created: ${createdAt}\n\n## Summary\n${summary}\n\n## Strengths\n${strengths.map((item) => `- ${item}`).join("\n")}\n\n## Growth areas\n${weaknesses.map((item) => `- ${item}`).join("\n")}\n\n## Recommendations\n${recommendations.map((item) => `- ${item}`).join("\n")}`,
      mimeType: "text/markdown"
    };
  }

  if (format === "html") {
    return {
      filename: `${baseName}.html`,
      content: `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Inter,Arial,sans-serif;padding:32px;color:#111827}h1,h2{margin:0 0 16px}section{margin-top:24px}ul{padding-left:20px}</style></head><body><h1>${title}</h1><p><strong>Candidate:</strong> ${candidateName}<br><strong>Created:</strong> ${createdAt}</p><section><h2>Summary</h2><p>${summary}</p></section><section><h2>Strengths</h2><ul>${strengths.map((item) => `<li>${item}</li>`).join("")}</ul></section><section><h2>Growth areas</h2><ul>${weaknesses.map((item) => `<li>${item}</li>`).join("")}</ul></section><section><h2>Recommendations</h2><ul>${recommendations.map((item) => `<li>${item}</li>`).join("")}</ul></section></body></html>`,
      mimeType: "text/html"
    };
  }

  return {
    filename: `${baseName}.txt`,
    content: [
      `Candidate: ${candidateName}`,
      `Interview: ${title}`,
      `Created: ${createdAt}`,
      "",
      "Summary:",
      summary,
      "",
      "Strengths:",
      ...strengths.map((item) => `- ${item}`),
      "",
      "Growth areas:",
      ...weaknesses.map((item) => `- ${item}`),
      "",
      "Recommendations:",
      ...recommendations.map((item) => `- ${item}`)
    ].join("\n"),
    mimeType: "text/plain"
  };
}

export async function exportTaskBank(domain: DomainKey, locale: LocaleCode) {
  await delay(80);

  const tasks = readCollection<Task[]>("tasks").filter((item) => item.domain === domain);
  const baseName = `${domain}-task-bank`;

  return {
    filename: `${baseName}.json`,
    content: JSON.stringify(
      tasks.map((task) => ({
        id: task.id,
        title: textOf(task.title, locale),
        difficulty: task.difficulty,
        overview: textOf(task.overview, locale),
        tags: task.tags,
        estimatedMinutes: task.estimatedMinutes,
        starterLanguages: Object.keys(task.starterCode)
      })),
      null,
      2
    ),
    mimeType: "application/json"
  };
}

export async function getSettings() {
  await delay(120);
  return {
    settings: readCollection<InterviewSettings>("settings"),
    tasks: readCollection<Task[]>("tasks")
  };
}

export async function saveSettings(nextSettings: InterviewSettings) {
  await delay(220);
  writeCollection("settings", nextSettings);
  return nextSettings;
}
