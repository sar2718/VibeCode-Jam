import { APP_CONFIG } from "@/config/app.config";
import { readCollection, writeAuthSession, writeCollection } from "@/services/storage.service";
import { readInterviewState } from "@/services/interviewState.service";
import type { AuthSession, DemoCredentials } from "@/types/auth";
import type { Candidate } from "@/types/candidate";
import type { InvitationPreview } from "@/types/invitation";
import type { Section } from "@/types/section";

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

function findCandidateSection(sections: Section[], candidateId: string) {
  return (
    sections.find((item) => item.candidateId === candidateId && item.status === "in_progress") ??
    sections.find((item) => item.candidateId === candidateId && item.status === "ready") ??
    sections.find((item) => item.candidateId === candidateId && item.status === "scheduled")
  );
}

export async function loginCandidate(credentials: DemoCredentials): Promise<AuthSession> {
  await delay();

  const expected = APP_CONFIG.demoCredentials.candidate;
  if (credentials.login !== expected.login || credentials.password !== expected.password) {
    throw new Error("INVALID_CANDIDATE_CREDENTIALS");
  }

  const candidates = readCollection<Candidate[]>("candidates");
  const { sections } = readInterviewState();
  const candidate = candidates[0];

  if (!candidate) {
    throw new Error("DEMO_CANDIDATE_NOT_FOUND");
  }

  const activeInterview = findCandidateSection(sections, candidate.id);

  const session: AuthSession = {
    role: "candidate",
    userId: candidate.id,
    fullName: candidate.fullName,
    activeSectionId: activeInterview?.id
  };

  writeAuthSession(session);
  return session;
}

export async function loginAdmin(credentials: DemoCredentials): Promise<AuthSession> {
  await delay();

  const expected = APP_CONFIG.demoCredentials.admin;
  if (credentials.login !== expected.login || credentials.password !== expected.password) {
    throw new Error("INVALID_ADMIN_CREDENTIALS");
  }

  const session: AuthSession = {
    role: "admin",
    userId: "admin-001",
    fullName: "Администратор"
  };

  writeAuthSession(session);
  return session;
}

function resolveAccessDeadline(section: Section) {
  return section.runtime.sessionEndsAt ?? section.invitation.closesAt;
}

function resolvePreview(section: Section, candidate: Candidate): InvitationPreview {
  const revoked = Boolean(section.invitation.revokedAt) || section.status === "revoked" || section.invitation.status === "revoked";
  const completed = section.status === "completed" || section.invitation.status === "completed";
  const expired = section.status === "expired" || section.invitation.status === "expired";
  const started = section.status === "in_progress" || section.invitation.status === "started";
  const scheduled = section.status === "scheduled" || section.invitation.status === "scheduled";
  const resolvedStatus = revoked
    ? "revoked"
    : completed
      ? "completed"
      : expired
        ? "expired"
        : started
          ? "started"
          : scheduled
            ? "scheduled"
            : "available";
  const canResume = resolvedStatus === "started" && !!section.runtime.canResume;
  const canStartNow = resolvedStatus === "available";

  return {
    candidateName: candidate.fullName,
    sectionId: section.id,
    sectionTitle: section.title,
    roleTemplate: section.roleTemplate,
    domain: section.domain,
    intro: section.intro,
    instructions: section.instructions,
    opensAt: section.invitation.opensAt,
    closesAt: section.invitation.closesAt,
    accessExpiresAt: resolveAccessDeadline(section),
    durationMinutes: section.durationMinutes,
    status: resolvedStatus,
    sessionStartedAt: section.runtime.startedAt,
    sessionEndsAt: section.runtime.sessionEndsAt,
    selectedLevel: section.runtime.selfAssessmentLevel,
    canStartNow,
    canResume
  };
}

export async function previewInvitation(hash: string): Promise<InvitationPreview> {
  await delay(120);

  const { sections } = readInterviewState();
  const candidates = readCollection<Candidate[]>("candidates");

  const section = sections.find((item) => item.invitation.hash === hash);
  if (!section) {
    throw new Error("INVITATION_NOT_FOUND");
  }

  const candidate = candidates.find((item) => item.id === section.candidateId);
  if (!candidate) {
    throw new Error("CANDIDATE_NOT_FOUND");
  }

  return resolvePreview(section, candidate);
}

export async function loginByInvitation(hash: string) {
  await delay();

  const { sections } = readInterviewState();
  const candidates = readCollection<Candidate[]>("candidates");

  const section = sections.find((item) => item.invitation.hash === hash);
  if (!section) {
    throw new Error("INVITATION_NOT_FOUND");
  }

  const candidate = candidates.find((item) => item.id === section.candidateId);
  if (!candidate) {
    throw new Error("CANDIDATE_NOT_FOUND");
  }

  if (section.invitation.revokedAt || section.invitation.status === "revoked" || section.status === "revoked") {
    throw new Error("INVITATION_REVOKED");
  }

  if (section.invitation.completedAt || section.invitation.status === "completed" || section.status === "completed") {
    throw new Error("INVITATION_COMPLETED");
  }

  if (section.invitation.status === "expired" || section.status === "expired") {
    throw new Error("INVITATION_EXPIRED");
  }

  if (section.invitation.status === "scheduled" && !section.runtime.startedAt) {
    throw new Error("INVITATION_NOT_STARTED_YET");
  }

  if (section.status === "in_progress" && !section.runtime.canResume) {
    throw new Error("INVITATION_RESUME_BLOCKED");
  }

  const nextSections = sections.map((item) =>
    item.id === section.id
      ? {
          ...item,
          invitation: {
            ...item.invitation,
            lastVisitedAt: new Date().toISOString()
          }
        }
      : item
  );
  writeCollection("sections", nextSections);

  const session: AuthSession = {
    role: "candidate",
    userId: candidate.id,
    fullName: candidate.fullName,
    activeSectionId: section.id,
    invitationHash: hash
  };

  writeAuthSession(session);
  return session;
}

export async function logout() {
  await delay(80);
  writeAuthSession(null);
}
