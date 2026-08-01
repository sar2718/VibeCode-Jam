import { useEffect, useRef, useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/route-paths";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { getCandidateDashboard, startSection } from "@/services/candidate.service";
import type { CandidateLevel } from "@/types/common";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { ErrorState } from "@/ui/ErrorState";
import { Skeleton } from "@/ui/Skeleton";
import { getErrorMessage } from "@/utils/errors";

const levels: CandidateLevel[] = ["intern", "junior", "middle", "senior", "lead"];

function getLevelDescription(level: CandidateLevel, locale: "ru" | "en") {
  switch (level) {
    case "intern":
      return locale === "ru"
        ? "Фокус на базовых структурах данных и аккуратной реализации."
        : "Focus on fundamentals and clear implementation.";
    case "junior":
      return locale === "ru"
        ? "Больше опоры на базовые решения и корректность."
        : "More support for foundational solutions.";
    case "middle":
      return locale === "ru"
        ? "Рабочий уровень для уверенного решения прикладных задач."
        : "A balanced level for hands-on problem solving.";
    case "senior":
      return locale === "ru"
        ? "Акцент на архитектуру, компромиссы и надёжность."
        : "Focus on architecture, trade-offs and reliability.";
    default:
      return locale === "ru"
        ? "Ожидается системное мышление и масштабирование решений."
        : "Expected to reason at system level and scale decisions confidently.";
  }
}

function getLevelCardClass(selected: boolean, locked: boolean) {
  if (locked) {
    return selected
      ? "rounded-[24px] border border-slate-300/35 bg-slate-200/65 px-4 py-4 text-left text-slate-950 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:border-white/20 dark:bg-slate-800/90 dark:text-white"
      : "rounded-[24px] border border-slate-200/35 bg-white/45 px-4 py-4 text-left text-slate-500 dark:border-white/5 dark:bg-slate-900/40 dark:text-slate-500";
  }

  return selected
    ? "rounded-[24px] border border-slate-950 bg-slate-950 px-4 py-4 text-left text-white shadow-lg transition-all duration-200 dark:border-white dark:bg-white dark:text-slate-950"
    : "rounded-[24px] border border-slate-200/80 bg-white/80 px-4 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10";
}

export function CandidateHomePage() {
  const navigate = useNavigate();
  const { session, setActiveSectionId } = useAuth();
  const { locale, t } = useI18n();
  const { data, isLoading, error } = useAsyncData(
    () => getCandidateDashboard(session?.userId ?? "", session?.activeSectionId),
    [session?.activeSectionId, session?.userId]
  );
  const [selectedLevel, setSelectedLevel] = useState<CandidateLevel | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const initializedSectionId = useRef<string | null>(null);

  useEffect(() => {
    if (!data?.currentSection) return;
    setActiveSectionId(data.currentSection.id);
    if (initializedSectionId.current !== data.currentSection.id) {
      initializedSectionId.current = data.currentSection.id;
      setSelectedLevel(data.currentSection.runtime.selfAssessmentLevel ?? "middle");
    }
  }, [data?.currentSection, setActiveSectionId]);

  async function handleStart() {
    if (!data?.currentSection || !selectedLevel) return;
    setStartError(null);
    setIsStarting(true);
    try {
      await startSection(data.currentSection.id, selectedLevel);
      setActiveSectionId(data.currentSection.id);
      navigate(ROUTES.candidate.session(data.currentSection.id));
    } catch (caughtError) {
      setStartError(caughtError instanceof Error ? caughtError.message : "UNKNOWN_ERROR");
    } finally {
      setIsStarting(false);
    }
  }

  if (isLoading) return <Skeleton className="h-[520px]" />;
  if (error || !data) return <ErrorState message={getErrorMessage(error, t)} />;

  const interview = data.currentSection;
  if (!interview) {
    return (
      <EmptyState
        title={locale === "ru" ? "Нет активного приглашения" : "No active invitation"}
        description={
          locale === "ru"
            ? "Откройте ссылку от администратора, чтобы перейти к интервью."
            : "Open the administrator link to access the interview."
        }
      />
    );
  }

  if (interview.status === "revoked" || interview.status === "expired") {
    return (
      <EmptyState
        title={
          interview.status === "revoked"
            ? locale === "ru"
              ? "Доступ отключён"
              : "Access disabled"
            : locale === "ru"
              ? "Срок доступа истёк"
              : "Access expired"
        }
        description={interview.status === "revoked" ? t("errors.INVITATION_REVOKED") : t("errors.INVITATION_EXPIRED")}
      />
    );
  }

  const levelLocked = interview.status !== "ready";
  const effectiveLevel = selectedLevel ?? interview.runtime.selfAssessmentLevel ?? "middle";
  const actionLabel = interview.status === "in_progress" ? t("common.resumeInterview") : t("common.startInterview");

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">

      <Card title={t("candidate.home.selfAssessmentTitle")}>
        <div className="grid gap-3">
          {levels.map((level) => {
            const selected = effectiveLevel === level;
            return (
              <button
                key={level}
                type="button"
                disabled={levelLocked}
                onClick={() => !levelLocked && setSelectedLevel(level)}
                className={getLevelCardClass(selected, levelLocked)}
              >
                <p className="text-base font-medium">{t(`common.levels.${level}`)}</p>
                <p
                  className={[
                    "mt-2 text-sm",
                    selected
                      ? levelLocked
                        ? "text-slate-600 dark:text-slate-300"
                        : "text-slate-200 dark:text-slate-700"
                      : levelLocked
                        ? "text-slate-500 dark:text-slate-500"
                        : "text-subtle"
                  ].join(" ")}
                >
                  {getLevelDescription(level, locale)}
                </p>
              </button>
            );
          })}
        </div>

        {startError ? (
          <div className="mt-4">
            <ErrorState compact message={getErrorMessage(startError, t)} />
          </div>
        ) : null}

        <Button
          className="mt-6 w-full"
          onClick={
            interview.status === "in_progress"
              ? () => navigate(ROUTES.candidate.session(interview.id))
              : () => void handleStart()
          }
          disabled={interview.status === "ready" ? isStarting || !selectedLevel : false}
        >
          {interview.status === "in_progress" ? <ArrowRight className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {interview.status === "ready" && isStarting ? `${t("common.loading")}...` : actionLabel}
        </Button>
      </Card>
    </div>
  );
}
