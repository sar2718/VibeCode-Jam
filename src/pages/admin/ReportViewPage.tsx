import { Download } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { ReportScoreBreakdown } from "@/components/admin/ReportScoreBreakdown";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useI18n } from "@/hooks/useI18n";
import { exportReport, getReportBySectionId } from "@/services/admin.service";
import type { ReportExportFormat } from "@/services/admin.service";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { ErrorState } from "@/ui/ErrorState";
import { PageHeader } from "@/ui/PageHeader";
import { Select } from "@/ui/Select";
import { Skeleton } from "@/ui/Skeleton";
import { downloadTextFile } from "@/utils/download";
import { formatDateTime, formatDecision, formatInterviewTitle } from "@/utils/format";
import { textOf } from "@/utils/i18n";
import { getErrorMessage } from "@/utils/errors";

export function ReportViewPage() {
  const { sectionId = "" } = useParams();
  const { locale, t } = useI18n();
  const [exportFormat, setExportFormat] = useState<ReportExportFormat>("txt");
  const { data, isLoading, error } = useAsyncData(() => getReportBySectionId(sectionId), [sectionId]);

  async function handleExport() {
    const payload = await exportReport(sectionId, locale, exportFormat);
    downloadTextFile(payload.filename, payload.content);
  }

  if (isLoading) {
    return <Skeleton className="h-[680px]" />;
  }

  if (error || !data || !data.report) {
    return <ErrorState message={getErrorMessage(error, t)} />;
  }

  const result = data.result;
  const candidate = data.candidate;
  const interview = data.section;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.report.title")}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[150px]">
              <Select value={exportFormat} onChange={(event) => setExportFormat(event.target.value as ReportExportFormat)}>
                <option value="txt">TXT</option>
                <option value="md">Markdown</option>
                <option value="json">JSON</option>
                <option value="html">HTML</option>
              </Select>
            </div>
            <Button variant="outline" onClick={() => void handleExport()}>
              <Download className="h-4 w-4" />
              {t("admin.report.export")}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              {interview ? <Badge variant="default">{t(`common.domains.${interview.domain}`)}</Badge> : null}
              {candidate ? <Badge variant="neutral">{candidate.fullName}</Badge> : null}
              {result ? (
                <Badge variant={result.decision === "no" ? "danger" : result.decision === "mixed" ? "warning" : "success"}>
                  {formatDecision(result.decision, locale)}
                </Badge>
              ) : null}
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">{interview ? formatInterviewTitle(textOf(interview.title, locale)) : t("admin.report.title")}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="surface-muted p-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">{locale === "ru" ? "Участник" : "Participant"}</p>
                <p className="mt-2 text-sm font-medium">{candidate?.fullName ?? t("common.notAvailable")}</p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">{locale === "ru" ? "Создан" : "Created"}</p>
                <p className="mt-2 text-sm font-medium">{formatDateTime(data.report.createdAt, locale)}</p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">{locale === "ru" ? "Итог" : "Decision"}</p>
                <p className="mt-2 text-sm font-medium">{result ? formatDecision(result.decision, locale) : t("common.notAvailable")}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title={locale === "ru" ? "Критерии оценки" : "Score breakdown"}>
            <ReportScoreBreakdown items={data.report.scoreBreakdown} />
          </Card>

          {result ? (
            <Card title={locale === "ru" ? "Сводка" : "Summary"}>
              <div className="space-y-3 text-sm text-subtle">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                  <span>{t("admin.results.score")}</span>
                  <span className="font-medium text-inherit">{result.overallScore}%</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                  <span>{t("admin.results.decision")}</span>
                  <span className="font-medium text-inherit">{formatDecision(result.decision, locale)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                  <span>{locale === "ru" ? "Самооценка" : "Self-assessment"}</span>
                  <span className="font-medium text-inherit">
                    {result.selfAssessmentLevel ? t(`common.levels.${result.selfAssessmentLevel}`) : t("common.notAvailable")}
                  </span>
                </div>
              </div>
            </Card>
          ) : null}

          <Card title={t("admin.report.antiCheat")}>
            <div className="space-y-4">
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{locale === "ru" ? "Общий риск" : "Overall risk"}</p>
                  <Badge
                    variant={
                      data.report.antiCheatSummary.overallRisk === "high"
                        ? "danger"
                        : data.report.antiCheatSummary.overallRisk === "medium"
                          ? "warning"
                          : "success"
                    }
                  >
                    {t(`common.risk.${data.report.antiCheatSummary.overallRisk}`)}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-subtle">{textOf(data.report.antiCheatSummary.notes, locale)}</p>
              </div>

              {data.report.antiCheatSummary.signals.map((signal) => (
                <div key={signal.key} className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{textOf(signal.label, locale)}</p>
                    <Badge variant={signal.level === "high" ? "danger" : signal.level === "medium" ? "warning" : "success"}>
                      {signal.value}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-subtle">{textOf(signal.description, locale)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
