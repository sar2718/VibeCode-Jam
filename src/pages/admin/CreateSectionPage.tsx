import { useState } from "react";
import type { FormEvent } from "react";
import { Copy, Link2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/app/route-paths";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useClipboard } from "@/hooks/useClipboard";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { createSection, getCandidates, getDomainLanguages, getSettings } from "@/services/admin.service";
import type { DomainKey, StartWindowMode } from "@/types/common";
import type { Section } from "@/types/section";
import { addDays, fromDateInputValueEnd, fromDateInputValueStart, toDateInputValue } from "@/utils/date";
import { getErrorMessage } from "@/utils/errors";
import { Button, buttonStyles } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { DateRangeField } from "@/ui/DateRangeField";
import { ErrorState } from "@/ui/ErrorState";
import { Input } from "@/ui/Input";
import { Modal } from "@/ui/Modal";
import { PageHeader } from "@/ui/PageHeader";
import { Select } from "@/ui/Select";
import { Skeleton } from "@/ui/Skeleton";
import { Textarea } from "@/ui/Textarea";

function domainRoleLabel(domain: DomainKey, locale: "ru" | "en") {
  const map = {
    algorithms: locale === "ru" ? "Алгоритмы" : "Algorithms",
    algorithms_sql: locale === "ru" ? "Алгоритмы + SQL" : "Algorithms + SQL"
  } satisfies Partial<Record<DomainKey, string>>;

  return map[domain as keyof typeof map] ?? (locale === "ru" ? "Интервью" : "Interview");
}

function buildTitle(domain: DomainKey, locale: "ru" | "en", participantName?: string) {
  const separator = " • ";
  const base = locale === "ru" ? `Интервью${separator}${domainRoleLabel(domain, locale)}` : `Interview${separator}${domainRoleLabel(domain, locale)}`;
  return participantName?.trim() ? `${base}${separator}${participantName.trim()}` : base;
}

export function CreateSectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCandidateId = searchParams.get("candidateId") ?? "";
  const { locale, t } = useI18n();
  const { notify } = useToast();
  const { copy } = useClipboard();
  const { data, isLoading, error } = useAsyncData(async () => {
    const [candidates, settingsPayload] = await Promise.all([getCandidates(), getSettings()]);
    return { candidates, settings: settingsPayload.settings };
  }, []);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdInterview, setCreatedInterview] = useState<Section | null>(null);
  const [candidateMode, setCandidateMode] = useState<"new" | "existing">(initialCandidateId ? "existing" : "new");
  const [form, setForm] = useState({
    candidateId: initialCandidateId,
    candidateName: "",
    candidateEmail: "",
    candidateNotes: "",
    domain: "algorithms" as DomainKey,
    startWindowMode: "relative_days" as StartWindowMode,
    startWindowDays: 7,
    startWindowRangeStart: toDateInputValue(new Date().toISOString()),
    startWindowRangeEnd: toDateInputValue(addDays(new Date(), 7).toISOString()),
    durationMinutes: 70,
    languageOptions: getDomainLanguages("algorithms"),
    participantInfo:
      locale === "ru"
        ? "Кандидат получает одну задачу за раз.\nПосле перехода к следующей задаче вернуться к предыдущей нельзя.\nВ конце интервью ответы сохраняются автоматически."
        : "The candidate receives one task at a time.\nAfter moving to the next task, returning to the previous one is not possible.\nAt the end of the interview, answers are saved automatically."
  });

  const selectedCandidate = data?.candidates.find((item) => item.id === form.candidateId);
  const previewTitle = buildTitle(
    form.domain,
    locale,
    candidateMode === "existing" ? selectedCandidate?.fullName : form.candidateName
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const interview = await createSection({
        candidateId: candidateMode === "existing" ? form.candidateId : undefined,
        candidate:
          candidateMode === "new"
            ? {
                fullName: form.candidateName,
                email: form.candidateEmail,
                notes: form.candidateNotes
              }
            : undefined,
        title: previewTitle,
        domain: form.domain,
        roleTemplate: domainRoleLabel(form.domain, locale),
        startWindowMode: form.startWindowMode,
        startWindowDays: form.startWindowMode === "relative_days" ? form.startWindowDays : undefined,
        startWindowStart:
          form.startWindowMode === "fixed_range"
            ? fromDateInputValueStart(form.startWindowRangeStart)
            : undefined,
        startWindowEnd:
          form.startWindowMode === "fixed_range"
            ? fromDateInputValueEnd(form.startWindowRangeEnd || form.startWindowRangeStart)
            : undefined,
        durationMinutes: form.durationMinutes,
        languageOptions: form.languageOptions,
        intro: form.participantInfo,
        instructions: form.participantInfo
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      });

      setCreatedInterview(interview);
      notify({ title: locale === "ru" ? "Ссылка создана" : "Access created", variant: "success" });
    } catch (caughtError) {
      setSubmitError(caughtError instanceof Error ? caughtError.message : "UNKNOWN_ERROR");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <Skeleton className="h-[760px]" />;
  if (error || !data) return <ErrorState message={getErrorMessage(error, t)} />;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title={locale === "ru" ? "Создать интервью" : "Create interview"} />

      <Card>
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
          <div className="lg:col-span-2 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100/80 p-1 dark:bg-white/5">
            <button
              type="button"
              className={
                candidateMode === "new"
                  ? "rounded-2xl bg-white px-4 py-3 text-sm font-medium shadow-sm dark:bg-white dark:text-slate-950"
                  : "rounded-2xl px-4 py-3 text-sm font-medium text-subtle"
              }
              onClick={() => setCandidateMode("new")}
            >
              {locale === "ru" ? "Новый кандидат" : "New participant"}
            </button>
            <button
              type="button"
              className={
                candidateMode === "existing"
                  ? "rounded-2xl bg-white px-4 py-3 text-sm font-medium shadow-sm dark:bg-white dark:text-slate-950"
                  : "rounded-2xl px-4 py-3 text-sm font-medium text-subtle"
              }
              onClick={() => setCandidateMode("existing")}
            >
              {locale === "ru" ? "Из списка" : "From list"}
            </button>
          </div>

          {candidateMode === "existing" ? (
            <div className="lg:col-span-2">
              <Select
                label={locale === "ru" ? "Кандидат" : "Participant"}
                value={form.candidateId}
                onChange={(event) => setForm((current) => ({ ...current, candidateId: event.target.value }))}
              >
                <option value="">{locale === "ru" ? "Выберите кандидата" : "Select participant"}</option>
                {data.candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.fullName}
                  </option>
                ))}
              </Select>
            </div>
          ) : (
            <>
              <Input
                label={locale === "ru" ? "Имя кандидата" : "Participant name"}
                value={form.candidateName}
                onChange={(event) => setForm((current) => ({ ...current, candidateName: event.target.value }))}
              />
              <Input
                label={locale === "ru" ? "Эл. почта" : "Email"}
                type="email"
                value={form.candidateEmail}
                onChange={(event) => setForm((current) => ({ ...current, candidateEmail: event.target.value }))}
              />
              <div className="lg:col-span-2">
                <Input
                  label={locale === "ru" ? "Заметка" : "Note"}
                  value={form.candidateNotes}
                  onChange={(event) => setForm((current) => ({ ...current, candidateNotes: event.target.value }))}
                />
              </div>
            </>
          )}

          <Select
            label={locale === "ru" ? "Дисциплина" : "Assessment domain"}
            value={form.domain}
            onChange={(event) => {
              const nextDomain = event.target.value as DomainKey;
              setForm((current) => ({
                ...current,
                domain: nextDomain,
                languageOptions: getDomainLanguages(nextDomain)
              }));
            }}
          >
            {data.settings.domains.map((domain) => (
              <option key={domain} value={domain}>
                {t(`common.domains.${domain}`)}
              </option>
            ))}
          </Select>

          <Input
            label={locale === "ru" ? "Длительность интервью, мин" : "Interview duration, minutes"}
            type="number"
            min={15}
            max={240}
            value={String(form.durationMinutes)}
            onChange={(event) => setForm((current) => ({ ...current, durationMinutes: Number(event.target.value) }))}
          />

          <Select
            label={locale === "ru" ? "Режим окна доступа" : "Access window mode"}
            value={form.startWindowMode}
            onChange={(event) => setForm((current) => ({ ...current, startWindowMode: event.target.value as StartWindowMode }))}
          >
            <option value="relative_days">{locale === "ru" ? "От текущего момента" : "From current moment"}</option>
            <option value="fixed_range">{locale === "ru" ? "Диапазон дат" : "Date range"}</option>
          </Select>

          {form.startWindowMode === "relative_days" ? (
            <Input
              label={locale === "ru" ? "Срок действия ключа, дней" : "Key lifetime, days"}
              type="number"
              min={1}
              max={30}
              value={String(form.startWindowDays)}
              onChange={(event) => setForm((current) => ({ ...current, startWindowDays: Number(event.target.value) }))}
            />
          ) : (
            <div className="lg:col-span-2">
              <DateRangeField
                label={locale === "ru" ? "Диапазон действия ключа" : "Key validity range"}
                locale={locale}
                start={form.startWindowRangeStart}
                end={form.startWindowRangeEnd}
                onChange={({ start, end }) =>
                  setForm((current) => ({
                    ...current,
                    startWindowRangeStart: start ?? current.startWindowRangeStart,
                    startWindowRangeEnd: end ?? ""
                  }))
                }
              />
            </div>
          )}

          <div className="lg:col-span-2">
            <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-subtle">
                {locale === "ru" ? "Языки программирования" : "Programming languages"}
                </span>
              <div className="flex flex-wrap gap-2">
                {data.settings.supportedLanguages
                  .filter((language) => getDomainLanguages(form.domain).includes(language))
                  .map((language) => {
                    const selected = form.languageOptions.includes(language);
                    return (
                      <button
                        key={language}
                        type="button"
                        className={buttonStyles({ variant: selected ? "primary" : "outline", size: "sm" })}
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            languageOptions: selected
                              ? current.languageOptions.filter((item) => item !== language)
                              : [...current.languageOptions, language]
                          }))
                        }
                      >
                        {language}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <Textarea
              label={locale === "ru" ? "Информация для участника" : "Participant information"}
              value={form.participantInfo}
              onChange={(event) => setForm((current) => ({ ...current, participantInfo: event.target.value }))}
              helperText={
                locale === "ru"
                  ? "Можно оставить в одной или нескольких строках."
                  : "You can keep the text in one or multiple lines."
              }
            />
          </div>

          {submitError ? (
            <div className="lg:col-span-2">
              <ErrorState compact message={getErrorMessage(submitError, t)} />
            </div>
          ) : null}

          <div className="lg:col-span-2 flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? `${t("common.loading")}...` : locale === "ru" ? "Создать ссылку" : "Create link"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.admin.sections)}>
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </Card>

      <Modal
        open={!!createdInterview}
        title={locale === "ru" ? "Ссылка готова" : "Access link ready"}
        description={
          locale === "ru"
            ? "Скопируйте полную ссылку или короткий ключ и отправьте их участнику."
            : "Copy the full link or the short key and share it with the participant."
        }
        onClose={() => setCreatedInterview(null)}
        footer={
          <Link to={ROUTES.admin.sections} className={buttonStyles({ variant: "primary" })}>
            {locale === "ru" ? "К списку интервью" : "Go to interviews"}
          </Link>
        }
      >
        {createdInterview ? (
          <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 text-sm text-subtle dark:border-white/10 dark:bg-white/5">
              {createdInterview.invitation.url}
            </div>
            <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 text-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
                {locale === "ru" ? "Короткий ключ" : "Short key"}
              </p>
              <p className="mt-2 font-mono text-sm">{createdInterview.invitation.hash}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  void copy(createdInterview.invitation.url);
                  notify({ title: locale === "ru" ? "Ссылка скопирована" : "Link copied", variant: "success" });
                }}
              >
                <Link2 className="h-4 w-4" />
                {locale === "ru" ? "Скопировать ссылку" : "Copy link"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  void copy(createdInterview.invitation.hash);
                  notify({ title: locale === "ru" ? "Ключ скопирован" : "Key copied", variant: "success" });
                }}
              >
                <Copy className="h-4 w-4" />
                {locale === "ru" ? "Скопировать ключ" : "Copy key"}
              </Button>
              <Link to={ROUTES.admin.candidate(createdInterview.candidateId)} className={buttonStyles({ variant: "outline" })}>
                {locale === "ru" ? "Карточка кандидата" : "Participant card"}
              </Link>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
