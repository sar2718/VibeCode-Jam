import { useParams } from "react-router-dom";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { getSectionBundle } from "@/services/candidate.service";
import { Badge } from "@/ui/Badge";
import { Card } from "@/ui/Card";
import { ErrorState } from "@/ui/ErrorState";
import { PageHeader } from "@/ui/PageHeader";
import { Skeleton } from "@/ui/Skeleton";
import { formatInterviewTitle } from "@/utils/format";
import { textOf } from "@/utils/i18n";
import { getErrorMessage } from "@/utils/errors";

export function CandidateReportPage() {
  const { session } = useAuth();
  const { locale, t } = useI18n();
  const { sectionId: routeSectionId } = useParams();
  const sectionId = routeSectionId ?? session?.activeSectionId ?? "";
  const { data, isLoading, error } = useAsyncData(() => getSectionBundle(sectionId), [sectionId]);

  if (isLoading) {
    return <Skeleton className="h-[420px]" />;
  }

  if (error || !data) {
    return <ErrorState title={t("candidate.complete.title")} message={getErrorMessage(error, t)} />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={t("candidate.complete.title")} />

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{formatInterviewTitle(textOf(data.section.title, locale))}</Badge>
        </div>
        <p className="mt-5 text-sm leading-7 text-subtle">{t("candidate.complete.summaryBody")}</p>
      </Card>
    </div>
  );
}
