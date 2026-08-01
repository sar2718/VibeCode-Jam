import { useState } from "react";
import { ArrowRight, Clock3, DoorOpen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/app/route-paths";
import { previewInvitation } from "@/services/auth.service";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { ErrorState } from "@/ui/ErrorState";
import { Skeleton } from "@/ui/Skeleton";
import { formatDateTime, formatMinutes } from "@/utils/format";
import { getErrorMessage } from "@/utils/errors";

export function InvitationPage() {
  const navigate = useNavigate();
  const { hash = "" } = useParams();
  const { loginByInvitation } = useAuth();
  const { locale, t } = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data, isLoading, error } = useAsyncData(() => previewInvitation(hash), [hash]);

  async function handleContinue() {
    if (!data || !(data.canStartNow || data.canResume)) {
      setSubmitError(
        data?.status === "revoked"
          ? "INVITATION_REVOKED"
          : data?.status === "expired"
            ? "INVITATION_EXPIRED"
            : data?.status === "completed"
              ? "INVITATION_COMPLETED"
              : "INVITATION_NOT_STARTED_YET"
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await loginByInvitation(hash);
      navigate(data.canResume ? ROUTES.candidate.session(data.sectionId) : ROUTES.candidate.root, { replace: true });
    } catch (caughtError) {
      setSubmitError(caughtError instanceof Error ? caughtError.message : "UNKNOWN_ERROR");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-[280px]" /></div>;
  if (error || !data) return <ErrorState title={locale === "ru" ? "Проверка доступа" : "Access validation"} message={getErrorMessage(error, t)} />;

  const canProceed = data.canStartNow || data.canResume;
  const isAccessRevoked = data.status === "revoked";

  return (
    <div className="mx-auto max-w-xl animate-fade-up">
      <Card title={locale === "ru" ? "Параметры доступа" : "Access details"}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/5">
            <p className="flex items-center gap-2 text-sm font-medium text-subtle"><DoorOpen className="h-4 w-4" />{locale === "ru" ? "Доступ до" : "Access until"}</p>
            <p className="mt-3 text-lg font-semibold">{formatDateTime(data.closesAt, locale)}</p>
          </div>
          <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/5">
            <p className="flex items-center gap-2 text-sm font-medium text-subtle"><Clock3 className="h-4 w-4" />{locale === "ru" ? "Длительность" : "Duration"}</p>
            <p className="mt-3 text-lg font-semibold">{formatMinutes(data.durationMinutes, locale)}</p>
          </div>
        </div>

        {isAccessRevoked ? (
          <div className="mt-4">
            <ErrorState
              compact
              title={locale === "ru" ? "Доступ ограничен" : "Access restricted"}
              message={
                locale === "ru"
                  ? "Администратор ограничил доступ по этой ссылке."
                  : "An administrator has restricted access for this invitation link."
              }
            />
          </div>
        ) : null}

        {submitError ? <div className="mt-4"><ErrorState compact message={getErrorMessage(submitError, t)} /></div> : null}

        {canProceed ? (
          <div className="mt-6 flex justify-end">
            <Button onClick={() => void handleContinue()} disabled={isSubmitting}>
              {isSubmitting
                ? `${t("common.loading")}...`
                : data.canResume
                  ? locale === "ru"
                    ? "Продолжить интервью"
                    : "Resume interview"
                  : locale === "ru"
                    ? "Перейти к старту"
                    : "Proceed to start"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
