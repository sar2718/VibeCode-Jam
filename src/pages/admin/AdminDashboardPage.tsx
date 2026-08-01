import { ArrowDown, ArrowUp, ArrowUpDown, Check, Link2, Layers3, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/app/route-paths";
import { FilterChip, FilterGroup, FilterToolbar } from "@/components/admin/FilterToolbar";
import { DOMAIN_OPTIONS, INTERVIEW_FILTER_STATUSES, getInterviewFilterStatus, type InterviewFilterStatus } from "@/config/status-options";
import { useClipboard } from "@/hooks/useClipboard";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { deleteSection, getCandidates, getSections, setInvitationActive } from "@/services/admin.service";
import type { DomainKey } from "@/types/common";
import { Badge } from "@/ui/Badge";
import { Button, buttonStyles } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { ErrorState } from "@/ui/ErrorState";
import { Modal } from "@/ui/Modal";
import { PageHeader } from "@/ui/PageHeader";
import { Skeleton } from "@/ui/Skeleton";
import { StatCard } from "@/ui/StatCard";
import { formatDateTime, formatInterviewTitle, formatMinutes } from "@/utils/format";
import { getErrorMessage } from "@/utils/errors";
import { textOf } from "@/utils/i18n";

function getStatusVariant(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "in_progress") return "info" as const;
  if (status === "revoked" || status === "expired") return "danger" as const;
  if (status === "ready" || status === "scheduled") return "warning" as const;
  return "default" as const;
}

export function AdminDashboardPage() {
  type SortField = "created" | "completed";
  type SortDirection = "asc" | "desc";

  const { locale, t } = useI18n();
  const { notify } = useToast();
  const { copy } = useClipboard();
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>("created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<InterviewFilterStatus[]>([]);
  const [domainFilters, setDomainFilters] = useState<DomainKey[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [busyInvitationHash, setBusyInvitationHash] = useState<string | null>(null);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, error } = useAsyncData(async () => {
    const [candidates, sections] = await Promise.all([getCandidates(), getSections()]);
    const activeSections = sections.filter((section) => section.status === "in_progress").length;
    return {
      totalCandidates: candidates.length,
      activeSections,
      sections
    };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const normalizedQuery = query.trim().toLowerCase();

    return data.sections.filter((section) => {
      const interviewStatus = getInterviewFilterStatus(section.status);
      const matchesQuery =
        !normalizedQuery ||
        formatInterviewTitle(textOf(section.title, locale)).toLowerCase().includes(normalizedQuery) ||
        section.candidateName.toLowerCase().includes(normalizedQuery) ||
        section.invitation.url.toLowerCase().includes(normalizedQuery) ||
        t(`common.domains.${section.domain}`).toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(interviewStatus);
      const matchesDomain = domainFilters.length === 0 || domainFilters.includes(section.domain);
      return matchesQuery && matchesStatus && matchesDomain;
    });
  }, [data, domainFilters, locale, query, statusFilters, t]);

  const sortedSections = useMemo(() => {
    return [...filtered].sort((left, right) => {
      const leftValue =
        sortField === "completed"
          ? Date.parse(left.completedAt ?? left.invitation.completedAt ?? left.updatedAt)
          : Date.parse(left.createdAt);
      const rightValue =
        sortField === "completed"
          ? Date.parse(right.completedAt ?? right.invitation.completedAt ?? right.updatedAt)
          : Date.parse(right.createdAt);
      return sortDirection === "asc" ? leftValue - rightValue : rightValue - leftValue;
    });
  }, [filtered, sortDirection, sortField]);

  useEffect(() => {
    if (!isSortMenuOpen) return;

    function handleOutside(event: MouseEvent) {
      if (!sortMenuRef.current) return;
      if (sortMenuRef.current.contains(event.target as Node)) return;
      setIsSortMenuOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSortMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSortMenuOpen]);

  function toggleFilter<T extends string>(value: T, setter: (updater: (current: T[]) => T[]) => void) {
    setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  }

  function resetFilters() {
    setQuery("");
    setStatusFilters([]);
    setDomainFilters([]);
    setShowFilters(false);
  }

  async function handleToggle(sectionId: string, invitationHash: string, active: boolean) {
    setBusyInvitationHash(invitationHash);
    try {
      await setInvitationActive(sectionId, invitationHash, active);
      notify({
        title: active ? t("toast.linkReopened") : t("toast.linkRevoked"),
        variant: active ? "success" : "warning"
      });
      setReloadKey((value) => value + 1);
    } finally {
      setBusyInvitationHash(null);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteSection(deleteId);
      notify({ title: locale === "ru" ? "\u0418\u043d\u0442\u0435\u0440\u0432\u044c\u044e \u0443\u0434\u0430\u043b\u0435\u043d\u043e" : "Interview deleted", variant: "warning" });
      setDeleteId(null);
      setReloadKey((value) => value + 1);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
        <Skeleton className="h-16" />
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState message={getErrorMessage(error, t)} />;
  }

  const deletingSection = filtered.find((item) => item.id === deleteId) ?? data.sections.find((item) => item.id === deleteId);
  const sortFieldLabel =
    sortField === "created"
      ? locale === "ru"
        ? "\u041f\u043e \u0441\u043e\u0437\u0434\u0430\u043d\u0438\u044e"
        : "By created"
      : locale === "ru"
      ? "\u041f\u043e \u043f\u0440\u043e\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u044e"
      : "By completed";
  const sortDirectionLabel =
    sortDirection === "asc"
      ? locale === "ru"
        ? "\u041f\u043e \u0432\u043e\u0437\u0440\u0430\u0441\u0442\u0430\u043d\u0438\u044e"
        : "Ascending"
      : locale === "ru"
      ? "\u041f\u043e \u0443\u0431\u044b\u0432\u0430\u043d\u0438\u044e"
      : "Descending";

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader title={locale === "ru" ? "\u041f\u0430\u043d\u0435\u043b\u044c \u0443\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u0438\u043d\u0442\u0435\u0440\u0432\u044c\u044e" : "Interview control panel"} />

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title={t("admin.dashboard.totalCandidates")} value={String(data.totalCandidates)} icon={<Users className="h-5 w-5" />} />
        <StatCard title={locale === "ru" ? "\u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0435 \u0438\u043d\u0442\u0435\u0440\u0432\u044c\u044e" : "Active interviews"} value={String(data.activeSections)} icon={<Layers3 className="h-5 w-5" />} />
      </div>

      <FilterToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder={locale === "ru" ? "\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442, \u0441\u0441\u044b\u043b\u043a\u0430 \u0438\u043b\u0438 \u043d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435" : "Candidate, link or domain"}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((value) => !value)}
        activeCount={statusFilters.length + domainFilters.length}
        toolbarActions={
          <div ref={sortMenuRef} className="relative z-50">
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 rounded-2xl p-0"
              onClick={() => setIsSortMenuOpen((value) => !value)}
              title={
                locale === "ru"
                  ? `\u0421\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u043a\u0430: ${sortFieldLabel}, ${sortDirectionLabel}`
                  : `Sort: ${sortFieldLabel}, ${sortDirectionLabel}`
              }
              aria-label={
                locale === "ru"
                  ? `\u0421\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u043a\u0430: ${sortFieldLabel}, ${sortDirectionLabel}`
                  : `Sort: ${sortFieldLabel}, ${sortDirectionLabel}`
              }
              aria-expanded={isSortMenuOpen}
              aria-haspopup="menu"
            >
              <ArrowUpDown className="h-5 w-5" />
            </Button>

            {isSortMenuOpen ? (
              <div className="absolute right-0 top-full z-[140] mt-2 w-56 rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/95">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle">
                  {locale === "ru" ? "\u041f\u043e\u043b\u0435" : "Field"}
                </p>
                <div className="mt-2 space-y-1">
                  <button
                    type="button"
                    className={[
                      "flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-medium transition",
                      sortField === "created"
                        ? "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-100"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                    ].join(" ")}
                    onClick={() => {
                      setSortField("created");
                      setIsSortMenuOpen(false);
                    }}
                  >
                    <span>{locale === "ru" ? "\u041f\u043e \u0441\u043e\u0437\u0434\u0430\u043d\u0438\u044e" : "By created"}</span>
                    {sortField === "created" ? <Check className="h-3.5 w-3.5" /> : null}
                  </button>
                  <button
                    type="button"
                    className={[
                      "flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-medium transition",
                      sortField === "completed"
                        ? "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-100"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                    ].join(" ")}
                    onClick={() => {
                      setSortField("completed");
                      setIsSortMenuOpen(false);
                    }}
                  >
                    <span>{locale === "ru" ? "\u041f\u043e \u043f\u0440\u043e\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u044e" : "By completed"}</span>
                    {sortField === "completed" ? <Check className="h-3.5 w-3.5" /> : null}
                  </button>
                </div>

                <div className="mt-3 border-t border-slate-200/70 pt-3 dark:border-white/10">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle">
                    {locale === "ru" ? "\u041f\u043e\u0440\u044f\u0434\u043e\u043a" : "Order"}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      className={[
                        "flex items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-xs font-medium transition",
                        sortDirection === "asc"
                          ? "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-100"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                      ].join(" ")}
                      onClick={() => {
                        setSortDirection("asc");
                        setIsSortMenuOpen(false);
                      }}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                      {locale === "ru" ? "\u0412\u0432\u0435\u0440\u0445" : "Asc"}
                    </button>
                    <button
                      type="button"
                      className={[
                        "flex items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-xs font-medium transition",
                        sortDirection === "desc"
                          ? "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-100"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                      ].join(" ")}
                      onClick={() => {
                        setSortDirection("desc");
                        setIsSortMenuOpen(false);
                      }}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                      {locale === "ru" ? "\u0412\u043d\u0438\u0437" : "Desc"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        }
        onReset={resetFilters}
      >
        <FilterGroup label={locale === "ru" ? "\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435" : "State"}>
          {INTERVIEW_FILTER_STATUSES.map((status) => {
            const labels: Record<InterviewFilterStatus, string> = {
              ready: locale === "ru" ? "\u041a \u0441\u0442\u0430\u0440\u0442\u0443" : "Ready",
              in_progress: locale === "ru" ? "\u0412 \u043f\u0440\u043e\u0446\u0435\u0441\u0441\u0435" : "In progress",
              completed: locale === "ru" ? "\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u043e" : "Completed",
              blocked: locale === "ru" ? "\u041d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e" : "Unavailable"
            };
            return (
              <FilterChip
                key={status}
                label={labels[status]}
                active={statusFilters.includes(status)}
                onClick={() => toggleFilter(status, setStatusFilters)}
              />
            );
          })}
        </FilterGroup>

        <FilterGroup label={locale === "ru" ? "\u041d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435" : "Domain"}>
          {DOMAIN_OPTIONS.map((domain) => (
            <FilterChip
              key={domain}
              label={t(`common.domains.${domain}`)}
              active={domainFilters.includes(domain)}
              onClick={() => toggleFilter(domain, setDomainFilters)}
            />
          ))}
        </FilterGroup>
      </FilterToolbar>

      {sortedSections.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {sortedSections.map((section) => {
            const isRevoked = Boolean(section.invitation.revokedAt) || section.status === "revoked" || section.invitation.status === "revoked";
            return (
              <Card
                key={`${section.invitation.hash}:${section.id}`}
                title={formatInterviewTitle(textOf(section.title, locale))}
                description={section.candidateName}
                action={<Badge variant={getStatusVariant(section.status)}>{t(`common.sectionStatus.${section.status}`)}</Badge>}
              >
                <div className="grid gap-4 text-sm text-subtle sm:grid-cols-2">
                  <div>
                    <p className="font-medium text-inherit">{t("admin.sections.startWindow")}</p>
                    <p className="mt-1">{formatDateTime(section.invitation.opensAt, locale)} - {formatDateTime(section.invitation.closesAt, locale)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-inherit">{t("public.invitation.sessionDuration")}</p>
                    <p className="mt-1">{formatMinutes(section.durationMinutes, locale)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-inherit">{t("admin.createSection.domainLabel")}</p>
                    <p className="mt-1">{t(`common.domains.${section.domain}`)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-inherit">{t("admin.sections.invitation")}</p>
                    <p className="mt-1 truncate whitespace-nowrap text-[13px]" title={section.invitation.url}>
                      {section.invitation.url}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void copy(section.invitation.url);
                      notify({ title: t("toast.inviteCopied"), variant: "success" });
                    }}
                  >
                    <Link2 className="h-4 w-4" />
                    {t("common.copy")}
                  </Button>
                  {section.status !== "completed" ? (
                    <Button
                      variant="dangerOutline"
                      size="sm"
                      onClick={() => void handleToggle(section.id, section.invitation.hash, isRevoked)}
                      disabled={busyInvitationHash === section.invitation.hash}
                    >
                      {isRevoked ? t("admin.sections.reactivate") : t("admin.sections.deactivate")}
                    </Button>
                  ) : null}
                  {section.status === "completed" ? (
                    <Link to={ROUTES.admin.report(section.id)} className={buttonStyles({ variant: "outline", size: "sm" })}>
                      {t("common.viewReport")}
                    </Link>
                  ) : null}
                  <Button variant="danger" size="sm" onClick={() => setDeleteId(section.id)}>
                    <Trash2 className="h-4 w-4" />
                    {locale === "ru" ? "\u0423\u0434\u0430\u043b\u0438\u0442\u044c" : "Delete"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={locale === "ru" ? "\u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e" : "Nothing found"}
          description={locale === "ru" ? "\u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u043f\u043e\u0438\u0441\u043a \u0438\u043b\u0438 \u0441\u043d\u044f\u0442\u044c \u0447\u0430\u0441\u0442\u044c \u0444\u0438\u043b\u044c\u0442\u0440\u043e\u0432." : "Try adjusting the search or clearing some filters."}
        />
      )}

      <Modal
        open={!!deleteId}
        title={locale === "ru" ? "\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0438\u043d\u0442\u0435\u0440\u0432\u044c\u044e" : "Delete interview"}
        description={locale === "ru" ? "\u0421\u0441\u044b\u043b\u043a\u0430, \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u044b \u0438 \u0438\u0441\u0442\u043e\u0440\u0438\u044f \u044d\u0442\u043e\u0433\u043e \u0438\u043d\u0442\u0435\u0440\u0432\u044c\u044e \u0431\u0443\u0434\u0443\u0442 \u0443\u0434\u0430\u043b\u0435\u043d\u044b. \u042d\u0442\u043e \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043d\u0435\u043b\u044c\u0437\u044f \u043e\u0442\u043c\u0435\u043d\u0438\u0442\u044c." : "The access link, results and history for this interview will be removed. This action cannot be undone."}
        onClose={() => setDeleteId(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteId(null)}>{t("common.cancel")}</Button>
            <Button variant="danger" onClick={() => void handleDelete()} disabled={isDeleting}>{locale === "ru" ? "\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u043e\u043a\u043e\u043d\u0447\u0430\u0442\u0435\u043b\u044c\u043d\u043e" : "Delete permanently"}</Button>
          </>
        }
      >
        <div className="rounded-[24px] border border-rose-500/15 bg-rose-500/6 p-4 text-sm text-rose-900 dark:border-rose-400/15 dark:bg-rose-400/10 dark:text-rose-100">
          {deletingSection ? formatInterviewTitle(textOf(deletingSection.title, locale)) : locale === "ru" ? "\u0418\u043d\u0442\u0435\u0440\u0432\u044c\u044e \u0431\u0443\u0434\u0435\u0442 \u0443\u0434\u0430\u043b\u0435\u043d\u043e." : "This interview will be deleted."}
        </div>
      </Modal>
    </div>
  );
}

