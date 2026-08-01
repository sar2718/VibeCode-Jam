import { addMinutes } from "@/utils/date";
import { readCollection, writeCollection } from "@/services/storage.service";
import type { Section } from "@/types/section";
import type { SectionResult } from "@/types/result";

interface SyncedState {
  sections: Section[];
  results: SectionResult[];
}

function toTimestamp(value?: string) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeSection(section: Section): Section {
  const runtime = section.runtime ?? ({} as Section["runtime"]);
  const invitation = section.invitation ?? ({} as Section["invitation"]);

  return {
    ...section,
    invitation: {
      ...invitation,
      hash: invitation.hash ?? "",
      url: invitation.url ?? "",
      mode: invitation.mode ?? "relative_days",
      opensAt: invitation.opensAt ?? new Date().toISOString(),
      closesAt: invitation.closesAt ?? new Date().toISOString(),
      status: invitation.status ?? "available",
      startWindowDays: invitation.startWindowDays,
      startedAt: invitation.startedAt,
      completedAt: invitation.completedAt,
      revokedAt: invitation.revokedAt,
      lastVisitedAt: invitation.lastVisitedAt
    },
    runtime: {
      selfAssessmentLevel: runtime.selfAssessmentLevel,
      startedAt: runtime.startedAt,
      sessionEndsAt: runtime.sessionEndsAt,
      currentTaskId: runtime.currentTaskId,
      deliveredTaskIds: asStringArray(runtime.deliveredTaskIds),
      completedTaskIds: asStringArray(runtime.completedTaskIds),
      adaptiveRound:
        typeof runtime.adaptiveRound === "number"
          ? runtime.adaptiveRound
          : asStringArray(runtime.completedTaskIds).length,
      canResume: Boolean(runtime.canResume),
      lastSuggestedDifficulty: runtime.lastSuggestedDifficulty
    }
  };
}

function normalizeResult(result: SectionResult): SectionResult {
  return {
    ...result,
    taskResults: Array.isArray(result.taskResults) ? result.taskResults : [],
    antiCheatSignals: Array.isArray(result.antiCheatSignals) ? result.antiCheatSignals : [],
    visibleTests: Array.isArray(result.visibleTests) ? result.visibleTests : [],
    strengths: Array.isArray(result.strengths) ? result.strengths : [],
    weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
    adaptiveDecisions: Array.isArray(result.adaptiveDecisions) ? result.adaptiveDecisions : []
  };
}

function syncSingleSection(section: Section, result?: SectionResult) {
  const now = Date.now();
  const nextSection = normalizeSection(section);
  const nextResult = result ? normalizeResult(result) : undefined;
  let changed = JSON.stringify(nextSection) !== JSON.stringify(section);
  let resultChanged = nextResult ? JSON.stringify(nextResult) !== JSON.stringify(result) : false;

  const startedAtMs = toTimestamp(nextSection.runtime.startedAt);
  const sessionEndsAtMs = toTimestamp(nextSection.runtime.sessionEndsAt);
  const opensAtMs = toTimestamp(nextSection.invitation.opensAt);
  const closesAtMs = toTimestamp(nextSection.invitation.closesAt);

  if (startedAtMs && !sessionEndsAtMs) {
    nextSection.runtime.sessionEndsAt = addMinutes(
      new Date(nextSection.runtime.startedAt as string),
      nextSection.durationMinutes
    ).toISOString();
    changed = true;
  }

  const resolvedSessionEndsAtMs = toTimestamp(nextSection.runtime.sessionEndsAt);

  if (nextSection.invitation.revokedAt && nextSection.status !== "revoked") {
    nextSection.status = "revoked";
    nextSection.invitation.status = "revoked";
    nextSection.runtime.canResume = false;
    changed = true;
  } else if (
    resolvedSessionEndsAtMs &&
    nextSection.status === "in_progress" &&
    now >= resolvedSessionEndsAtMs
  ) {
    nextSection.status = "completed";
    nextSection.completedAt = nextSection.runtime.sessionEndsAt;
    nextSection.invitation.status = "completed";
    nextSection.invitation.completedAt =
      nextSection.invitation.completedAt ?? nextSection.runtime.sessionEndsAt;
    nextSection.runtime.canResume = false;
    changed = true;

    if (nextResult && nextResult.finalStatus !== "reviewed") {
      nextResult.finalStatus = "submitted";
      nextResult.updatedAt = nextSection.runtime.sessionEndsAt ?? nextResult.updatedAt;
      resultChanged = true;
    }
  } else if (
    !startedAtMs &&
    closesAtMs &&
    now > closesAtMs &&
    nextSection.status !== "completed"
  ) {
    nextSection.status = "expired";
    nextSection.invitation.status = "expired";
    nextSection.runtime.canResume = false;
    changed = true;
  } else if (
    !startedAtMs &&
    opensAtMs &&
    now < opensAtMs &&
    nextSection.status !== "scheduled"
  ) {
    nextSection.status = "scheduled";
    nextSection.invitation.status = "scheduled";
    changed = true;
  } else if (
    !startedAtMs &&
    opensAtMs &&
    closesAtMs &&
    now >= opensAtMs &&
    now <= closesAtMs &&
    nextSection.status !== "ready"
  ) {
    nextSection.status = "ready";
    nextSection.invitation.status = "available";
    changed = true;
  }

  if (startedAtMs && nextSection.status !== "completed" && nextSection.status !== "revoked") {
    nextSection.status = "in_progress";
    nextSection.invitation.status = "started";
    nextSection.runtime.canResume = true;
    changed = true;
  }

  return {
    section: nextSection,
    result: nextResult,
    changed,
    resultChanged
  };
}

export function readInterviewState(): SyncedState {
  const sections = readCollection<Section[]>("sections");
  const results = readCollection<SectionResult[]>("results");

  let sectionChanged = false;
  let resultChanged = false;

  const nextResults = results.map((item) => normalizeResult(item));

  const nextSections = sections.map((section) => {
    const resultIndex = nextResults.findIndex((item) => item.sectionId === section.id);
    const synced = syncSingleSection(section, resultIndex >= 0 ? nextResults[resultIndex] : undefined);

    if (synced.changed) {
      sectionChanged = true;
    }

    if (resultIndex >= 0 && synced.result) {
      if (synced.resultChanged || JSON.stringify(nextResults[resultIndex]) !== JSON.stringify(synced.result)) {
        nextResults[resultIndex] = synced.result;
        resultChanged = true;
      }
    }

    return synced.section;
  });

  if (sectionChanged) {
    writeCollection("sections", nextSections);
  }

  if (sectionChanged || resultChanged) {
    writeCollection("results", nextResults);
  }

  return {
    sections: nextSections,
    results: nextResults
  };
}
