import { Link2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/app/route-paths";
import { CandidateInterviewCreateModal } from "@/components/admin/CandidateInterviewCreateModal";
import { Avatar } from "@/ui/Avatar";
import { Badge } from "@/ui/Badge";
import { Button, buttonStyles } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { ErrorState } from "@/ui/ErrorState";
import { Input } from "@/ui/Input";
import { Modal } from "@/ui/Modal";
import { PageHeader } from "@/ui/PageHeader";
import { Select } from "@/ui/Select";
import { Skeleton } from "@/ui/Skeleton";
import { StatCard } from "@/ui/StatCard";
import { Textarea } from "@/ui/Textarea";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useClipboard } from "@/hooks/useClipboard";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { deleteCandidate, getCandidateById, updateCandidate } from "@/services/admin.service";
import type { DomainKey } from "@/types/common";
import { formatDateTime, formatDecision, formatInterviewTitle } from "@/utils/format";
import { textOf } from "@/utils/i18n";
import { getErrorMessage } from "@/utils/errors";

function getStatusVariant(status: string) {
  if (status === "completed") return "success";
  if (status === "in_progress") return "info";
  if (status === "ready") return "warning";
  if (status === "revoked" || status === "expired") return "danger";
  return "default" as const;
}

function SliceToggle({
  open,
  onToggle,
  locale
}: {
  open: boolean;
  onToggle: () => void;
  locale: "ru" | "en";
}) {
  return (
    <Button variant="ghost" size="sm" onClick={onToggle}>
      {open ? (locale === "ru" ? "\u0421\u0432\u0435\u0440\u043d\u0443\u0442\u044c" : "Show less") : locale === "ru" ? "\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u0435\u0449\u0451" : "Show more"}
    </Button>
  );
}

export function CandidateDetailPage() {
  const { candidateId = "" } = useParams();
  const navigate = useNavigate();
  const { locale, t } = useI18n();
  const { copy } = useClipboard();
  const { notify } = useToast();
  const [reloadKey, setReloadKey] = useState(0);
  const { data, isLoading, error } = useAsyncData(() => getCandidateById(candidateId), [candidateId, reloadKey]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateInterviewOpen, setIsCreateInterviewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showAllActive, setShowAllActive] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    targetRole: "",
    targetLevel: "middle",
    preferredDomain: "algorithms" as DomainKey,
    notes: ""
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      fullName: data.candidate.fullName,
      email: data.candidate.email,
      targetRole: textOf(data.candidate.targetRole, locale),
      targetLevel: data.candidate.targetLevel,
      preferredDomain: data.candidate.preferredDomain,
      notes: data.candidate.notes ? textOf(data.candidate.notes, locale) : ""
    });
  }, [data, locale]);

  async function handleSave() {
    setIsSaving(true);
    setFormError(null);
    try {
      await updateCandidate(candidateId, {
        fullName: form.fullName,
        email: form.email,
        targetRole: form.targetRole,
        targetLevel: form.targetLevel as any,
        preferredDomain: form.preferredDomain,
        notes: form.notes
      });
      setIsEditOpen(false);
      setReloadKey((value) => value + 1);
      notify({ title: locale === "ru" ? "\u0414\u0430\u043d\u043d\u044b\u0435 \u0443\u0447\u0430\u0441\u0442\u043d\u0438\u043a\u0430 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u044b" : "Participant updated", variant: "success" });
    } catch (caughtError) {
      setFormError(caughtError instanceof Error ? caughtError.message : "UNKNOWN_ERROR");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsSaving(true);
    setFormError(null);
    try {
      await deleteCandidate(candidateId);
      notify({ title: locale === "ru" ? "\u0423\u0447\u0430\u0441\u0442\u043d\u0438\u043a \u0443\u0434\u0430\u043b\u0451\u043d" : "Participant deleted", variant: "warning" });
      navigate(ROUTES.admin.candidates, { replace: true });
    } catch (caughtError) {
      setFormError(caughtError instanceof Error ? caughtError.message : "UNKNOWN_ERROR");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <Skeleton className="h-[620px]" />;
  }

  if (error || !data) {
    return <ErrorState message={getErrorMessage(error, t)} />;
  }

  const activeSectionsAll = data.sections.filter((section) => section.status !== "completed");
  const completedSectionsAll = data.sections.filter((section) => section.status === "completed");
  const activeSections = showAllActive ? activeSectionsAll : activeSectionsAll.slice(0, 3);
  const completedSections = showAllCompleted ? completedSectionsAll : completedSectionsAll.slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        title={locale === "ru" ? "\u041a\u0430\u0440\u0442\u043e\u0447\u043a\u0430 \u0443\u0447\u0430\u0441\u0442\u043d\u0438\u043a\u0430" : "Participant profile"}
        description={data.candidate.fullName}
        actions={
          <>
            <Button onClick={() => setIsCreateInterviewOpen(true)}>
              <Plus className="h-4 w-4" />
              {locale === "ru" ? "\u041d\u043e\u0432\u043e\u0435 \u0438\u043d\u0442\u0435\u0440\u0432\u044c\u044e" : "New interview"}
            </Button>
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              {locale === "ru" ? "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c" : "Edit"}
            </Button>
            <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
              {locale === "ru" ? "\u0423\u0434\u0430\u043b\u0438\u0442\u044c" : "Delete"}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <StatCard title={locale === "ru" ? "\u041f\u0440\u0435\u0434\u043c\u0435\u0442\u043d\u0430\u044f \u043e\u0431\u043b\u0430\u0441\u0442\u044c" : "Domain"} value={t(`common.domains.${data.candidate.preferredDomain}`)} />
        <StatCard title={t("admin.candidateDetail.score")} value={`${data.candidate.scoreAverage}%`} />
        <StatCard title={t("admin.candidateDetail.antiCheat")} value={t(`common.risk.${data.candidate.antiCheatRisk}`)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Card title={t("admin.candidateDetail.about")}>
          <div className="flex items-start gap-4">
            <Avatar name={data.candidate.fullName} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-xl font-semibold tracking-tight">{data.candidate.fullName}</p>
              <p className="mt-1 text-sm text-subtle">{data.candidate.email}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="neutral">{textOf(data.candidate.targetRole, locale)}</Badge>
              </div>
              <div className="mt-5 grid gap-4 text-sm text-subtle sm:grid-cols-2">
                <div>
                  <p className="font-medium text-inherit">{locale === "ru" ? "Создан" : "Created"}</p>
                  <p className="mt-1">{formatDateTime(data.candidate.createdAt, locale)}</p>
                </div>
                <div>
                  <p className="font-medium text-inherit">{locale === "ru" ? "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u044f\u044f \u0430\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c" : "Last activity"}</p>
                  <p className="mt-1">{formatDateTime(data.candidate.lastActivityAt, locale)}</p>
                </div>
                <div>
                  <p className="font-medium text-inherit">{locale === "ru" ? "\u0421\u0442\u0430\u0442\u0443\u0441 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430" : "Candidate status"}</p>
                  <p className="mt-1">{t(`common.candidateStatus.${data.candidate.status}`)}</p>
                </div>
              </div>
            </div>
          </div>
          {data.candidate.notes ? (
            <div className="mt-6 rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-medium">{t("admin.candidateDetail.notes")}</p>
              <p className="mt-2 text-sm text-subtle">{textOf(data.candidate.notes, locale)}</p>
            </div>
          ) : null}
        </Card>

        <Card
          title={t("admin.candidateDetail.currentSections")}
          action={activeSectionsAll.length > 3 ? <SliceToggle open={showAllActive} onToggle={() => setShowAllActive((value) => !value)} locale={locale} /> : null}
        >
          <div className="space-y-4">
            {activeSections.length ? (
              activeSections.map((section) => (
                <div key={section.id} className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{formatInterviewTitle(textOf(section.title, locale))}</p>
                    </div>
                    <Badge variant={getStatusVariant(section.status)}>{t(`common.sectionStatus.${section.status}`)}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-subtle sm:grid-cols-2">
                    <div>
                      <p className="font-medium text-inherit">{t("public.invitation.startWindow")}</p>
                      <p className="mt-1">{formatDateTime(section.invitation.opensAt, locale)} - {formatDateTime(section.invitation.closesAt, locale)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-inherit">{locale === "ru" ? "\u041d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435" : "Domain"}</p>
                      <p className="mt-1">{t(`common.domains.${section.domain}`)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className={buttonStyles({ variant: "outline", size: "sm" })}
                      onClick={() => {
                        void copy(section.invitation.url);
                        notify({ title: t("toast.inviteCopied"), variant: "success" });
                      }}
                    >
                      <Link2 className="h-4 w-4" />
                      {t("common.copy")}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-200/80 p-4 text-sm text-subtle dark:border-white/10">{t("common.empty.description")}</div>
            )}
          </div>
        </Card>
      </div>

      <Card
        title={locale === "ru" ? "\u0417\u0430\u0432\u0435\u0440\u0448\u0451\u043d\u043d\u044b\u0435 \u0438\u043d\u0442\u0435\u0440\u0432\u044c\u044e" : "Completed interviews"}
        description={t("admin.results.description")}
        action={completedSectionsAll.length > 3 ? <SliceToggle open={showAllCompleted} onToggle={() => setShowAllCompleted((value) => !value)} locale={locale} /> : null}
      >
        {completedSections.length ? (
          <div className="space-y-4">
            {completedSections.map((section) => {
              const result = data.results.find((item) => item.sectionId === section.id);
              return (
                <div key={section.id} className="flex flex-wrap items-start justify-between gap-4 rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                  <div>
                    <p className="font-medium">{formatInterviewTitle(textOf(section.title, locale))}</p>
                    <p className="mt-1 text-sm text-subtle">{section.completedAt ? formatDateTime(section.completedAt, locale) : formatDateTime(section.updatedAt, locale)}</p>
                    {result ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="success">{result.overallScore}%</Badge>
                        <Badge variant="default">{formatDecision(result.decision, locale)}</Badge>
                      </div>
                    ) : null}
                  </div>
                  <Link to={ROUTES.admin.report(section.id)} className={buttonStyles({ variant: "outline", size: "sm" })}>{t("common.viewReport")}</Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-slate-200/80 p-4 text-sm text-subtle dark:border-white/10">{t("admin.candidateDetail.noCompleted")}</div>
        )}
      </Card>

      <CandidateInterviewCreateModal
        open={isCreateInterviewOpen}
        onClose={() => setIsCreateInterviewOpen(false)}
        candidateId={data.candidate.id}
        candidateName={data.candidate.fullName}
        defaultDomain={data.candidate.preferredDomain}
        onCreated={() => setReloadKey((value) => value + 1)}
      />

      <Modal
        open={isEditOpen}
        title={locale === "ru" ? "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0443\u0447\u0430\u0441\u0442\u043d\u0438\u043a\u0430" : "Edit participant"}
        description={locale === "ru" ? "\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f \u043f\u0440\u0438\u043c\u0435\u043d\u044f\u0442\u0441\u044f \u043a \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0435 \u0443\u0447\u0430\u0441\u0442\u043d\u0438\u043a\u0430 \u0438 \u0431\u0443\u0434\u0443\u0449\u0438\u043c \u0438\u043d\u0442\u0435\u0440\u0432\u044c\u044e." : "Changes will be applied to the participant profile and future interviews."}
        onClose={() => setIsEditOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={() => void handleSave()} disabled={isSaving}>{locale === "ru" ? "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c" : "Save"}</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={locale === "ru" ? "\u0418\u043c\u044f" : "Name"} value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
          <Input label={locale === "ru" ? "\u042d\u043b. \u043f\u043e\u0447\u0442\u0430" : "Email"} value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          <Input label={locale === "ru" ? "\u0420\u043e\u043b\u044c" : "Role"} value={form.targetRole} onChange={(event) => setForm((current) => ({ ...current, targetRole: event.target.value }))} />
          <Select label={locale === "ru" ? "\u041d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435" : "Domain"} value={form.preferredDomain} onChange={(event) => setForm((current) => ({ ...current, preferredDomain: event.target.value as DomainKey }))}>
            {["algorithms", "algorithms_sql"].map((domain) => <option key={domain} value={domain}>{t(`common.domains.${domain}`)}</option>)}
          </Select>
          <Select label={locale === "ru" ? "\u0426\u0435\u043b\u0435\u0432\u043e\u0439 \u0443\u0440\u043e\u0432\u0435\u043d\u044c" : "Target level"} value={form.targetLevel} onChange={(event) => setForm((current) => ({ ...current, targetLevel: event.target.value }))}>
            {["intern", "junior", "middle", "senior", "lead"].map((level) => <option key={level} value={level}>{t(`common.levels.${level}`)}</option>)}
          </Select>
          <div className="sm:col-span-2">
            <Textarea label={locale === "ru" ? "\u0417\u0430\u043c\u0435\u0442\u043a\u0430" : "Note"} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
          </div>
          {formError ? <div className="sm:col-span-2"><ErrorState compact message={getErrorMessage(formError, t)} /></div> : null}
        </div>
      </Modal>

      <Modal
        open={isDeleteOpen}
        title={locale === "ru" ? "\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0443\u0447\u0430\u0441\u0442\u043d\u0438\u043a\u0430" : "Delete participant"}
        description={locale === "ru" ? "\u042d\u0442\u043e \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0443\u0434\u0430\u043b\u0438\u0442 \u0443\u0447\u0430\u0441\u0442\u043d\u0438\u043a\u0430, \u0432\u0441\u0435 \u0435\u0433\u043e \u0438\u043d\u0442\u0435\u0440\u0432\u044c\u044e, \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u044b \u0438 \u043e\u0442\u0447\u0451\u0442\u044b. \u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0431\u0443\u0434\u0435\u0442 \u043d\u0435\u043b\u044c\u0437\u044f." : "This will remove the participant, all interviews, results and reports. This action cannot be undone."}
        onClose={() => setIsDeleteOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>{t("common.cancel")}</Button>
            <Button variant="danger" onClick={() => void handleDelete()} disabled={isSaving}>{locale === "ru" ? "\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u043e\u043a\u043e\u043d\u0447\u0430\u0442\u0435\u043b\u044c\u043d\u043e" : "Delete permanently"}</Button>
          </>
        }
      >
        <div className="rounded-[24px] border border-rose-500/15 bg-rose-500/6 p-4 text-sm text-rose-900 dark:border-rose-400/15 dark:bg-rose-400/10 dark:text-rose-100">
          {locale === "ru"
            ? `\u0411\u0443\u0434\u0435\u0442 \u0443\u0434\u0430\u043b\u0451\u043d \u0443\u0447\u0430\u0441\u0442\u043d\u0438\u043a ${data.candidate.fullName}. \u0411\u0443\u0434\u0443\u0442 \u0443\u0434\u0430\u043b\u0435\u043d\u044b \u0438 \u0432\u0441\u0435 \u0441\u0432\u044f\u0437\u0430\u043d\u043d\u044b\u0435 \u0438\u043d\u0442\u0435\u0440\u0432\u044c\u044e.`
            : `${data.candidate.fullName} will be deleted together with all linked interviews.`}
        </div>
      </Modal>
    </div>
  );
}
