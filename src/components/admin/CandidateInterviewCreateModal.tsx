import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Copy, Link2 } from "lucide-react";
import { createSection, getDomainLanguages } from "@/services/admin.service";
import type { DomainKey, StartWindowMode } from "@/types/common";
import type { Section } from "@/types/section";
import { addDays, fromDateInputValueEnd, fromDateInputValueStart, toDateInputValue } from "@/utils/date";
import { getErrorMessage } from "@/utils/errors";
import { useClipboard } from "@/hooks/useClipboard";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/ui/Button";
import { DateRangeField } from "@/ui/DateRangeField";
import { ErrorState } from "@/ui/ErrorState";
import { Input } from "@/ui/Input";
import { Modal } from "@/ui/Modal";
import { Select } from "@/ui/Select";
import { Textarea } from "@/ui/Textarea";

type InterviewFormState = {
  domain: DomainKey;
  startWindowMode: StartWindowMode;
  startWindowDays: number;
  startWindowRangeStart: string;
  startWindowRangeEnd: string;
  durationMinutes: number;
  languageOptions: string[];
  participantInfo: string;
};

function domainRoleLabel(domain: DomainKey, locale: "ru" | "en") {
  const map: Partial<Record<DomainKey, string>> = {
    algorithms: locale === "ru" ? "Алгоритмы" : "Algorithms",
    algorithms_sql: locale === "ru" ? "Алгоритмы + SQL" : "Algorithms + SQL"
  };

  return map[domain] ?? (locale === "ru" ? "Интервью" : "Interview");
}

function buildTitle(domain: DomainKey, locale: "ru" | "en", participantName: string) {
  const separator = " • ";
  const base = locale === "ru" ? `Интервью${separator}${domainRoleLabel(domain, locale)}` : `Interview${separator}${domainRoleLabel(domain, locale)}`;
  return participantName.trim() ? `${base}${separator}${participantName.trim()}` : base;
}

function defaultParticipantInfo(locale: "ru" | "en") {
  return locale === "ru"
    ? "Кандидат получает одну задачу за раз.\nПосле перехода к следующей задаче вернуться к предыдущей нельзя.\nВ конце интервью ответы сохраняются автоматически."
    : "The candidate receives one task at a time.\nAfter moving to the next task, returning to the previous one is not possible.\nAt the end of the interview, answers are saved automatically.";
}

function buildInitialForm(locale: "ru" | "en", domain: DomainKey): InterviewFormState {
  return {
    domain,
    startWindowMode: "relative_days",
    startWindowDays: 7,
    startWindowRangeStart: toDateInputValue(new Date().toISOString()),
    startWindowRangeEnd: toDateInputValue(addDays(new Date(), 7).toISOString()),
    durationMinutes: 70,
    languageOptions: getDomainLanguages(domain),
    participantInfo: defaultParticipantInfo(locale)
  };
}

export function CandidateInterviewCreateModal({
  open,
  onClose,
  candidateId,
  candidateName,
  defaultDomain,
  onCreated
}: {
  open: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  defaultDomain: DomainKey;
  onCreated?: () => void;
}) {
  const { locale, t } = useI18n();
  const { notify } = useToast();
  const { copy } = useClipboard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdInterview, setCreatedInterview] = useState<Section | null>(null);
  const [form, setForm] = useState<InterviewFormState>(() => buildInitialForm(locale, defaultDomain));

  useEffect(() => {
    if (!open) return;
    setSubmitError(null);
    setForm(buildInitialForm(locale, defaultDomain));
  }, [defaultDomain, locale, open]);

  function handleCreatedInterviewClose() {
    setCreatedInterview(null);
    onCreated?.();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const interview = await createSection({
        candidateId,
        title: buildTitle(form.domain, locale, candidateName),
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

      notify({ title: t("toast.sectionCreated"), variant: "success" });
      onClose();
      setCreatedInterview(interview);
    } catch (caughtError) {
      setSubmitError(caughtError instanceof Error ? caughtError.message : "UNKNOWN_ERROR");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Modal
        open={open}
        title={locale === "ru" ? "Новое интервью" : "New interview"}
        description={locale === "ru" ? `Кандидат: ${candidateName}` : `Candidate: ${candidateName}`}
        onClose={onClose}
      >
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={(event) => void handleSubmit(event)}>
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
            {["algorithms", "algorithms_sql"].map((domain) => (
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
                end={form.startWindowRangeEnd || undefined}
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
                {getDomainLanguages(form.domain).map((language) => {
                  const selected = form.languageOptions.includes(language);
                  return (
                    <button
                      key={language}
                      type="button"
                      className={`inline-flex h-9 items-center justify-center rounded-2xl px-3 text-sm transition ${
                        selected
                          ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                          : "border border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
                      }`}
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
            />
          </div>

          {submitError ? (
            <div className="lg:col-span-2">
              <ErrorState compact message={getErrorMessage(submitError, t)} />
            </div>
          ) : null}

          <div className="lg:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? `${t("common.loading")}...` : (locale === "ru" ? "Создать ссылку" : "Create link")}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!createdInterview}
        title={locale === "ru" ? "Ссылка готова" : "Access link ready"}
        description={
          locale === "ru"
            ? "Скопируйте полную ссылку или короткий ключ и отправьте их участнику."
            : "Copy the full link or the short key and share it with the participant."
        }
        onClose={handleCreatedInterviewClose}
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
                  notify({ title: t("toast.inviteCopied"), variant: "success" });
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
              <Button type="button" onClick={handleCreatedInterviewClose}>
                {locale === "ru" ? "Готово" : "Done"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
