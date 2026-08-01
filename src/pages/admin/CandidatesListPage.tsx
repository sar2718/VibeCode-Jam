import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { CandidateTable } from "@/components/admin/CandidateTable";
import { FilterChip, FilterGroup, FilterToolbar } from "@/components/admin/FilterToolbar";
import { CANDIDATE_FILTER_STATUSES, DOMAIN_OPTIONS } from "@/config/status-options";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { createCandidate, getCandidates } from "@/services/admin.service";
import type { CandidateStatus, DomainKey } from "@/types/common";
import { Button } from "@/ui/Button";
import { EmptyState } from "@/ui/EmptyState";
import { ErrorState } from "@/ui/ErrorState";
import { Input } from "@/ui/Input";
import { Modal } from "@/ui/Modal";
import { PageHeader } from "@/ui/PageHeader";
import { Select } from "@/ui/Select";
import { Skeleton } from "@/ui/Skeleton";
import { Textarea } from "@/ui/Textarea";
import { getErrorMessage } from "@/utils/errors";
import { textOf } from "@/utils/i18n";

function buildInitialForm() {
  return {
    fullName: "",
    email: "",
    preferredDomain: "algorithms" as DomainKey,
    notes: ""
  };
}

export function CandidatesListPage() {
  const { locale, t } = useI18n();
  const { notify } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [domainFilters, setDomainFilters] = useState<DomainKey[]>([]);
  const [statusFilters, setStatusFilters] = useState<CandidateStatus[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState(() => buildInitialForm());
  const { data, isLoading, error } = useAsyncData(() => getCandidates(), [reloadKey]);

  const openFromQuery = searchParams.get("create") === "1";

  useEffect(() => {
    if (openFromQuery) {
      setIsCreateOpen(true);
    }
  }, [openFromQuery]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const value = query.trim().toLowerCase();

    return data.filter((candidate) => {
      const matchesQuery =
        !value ||
        [
          candidate.fullName,
          candidate.email,
          textOf(candidate.targetRole, locale),
          t(`common.domains.${candidate.preferredDomain}`),
          candidate.inferredLevel ? t(`common.levels.${candidate.inferredLevel}`) : ""
        ]
          .join(" ")
          .toLowerCase()
          .includes(value);
      const matchesDomain = domainFilters.length === 0 || domainFilters.includes(candidate.preferredDomain);
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(candidate.status);
      return matchesQuery && matchesDomain && matchesStatus;
    });
  }, [data, domainFilters, locale, query, statusFilters, t]);

  function toggleFilter<T extends string>(value: T, setter: (updater: (current: T[]) => T[]) => void) {
    setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  }

  function resetFilters() {
    setQuery("");
    setDomainFilters([]);
    setStatusFilters([]);
    setShowFilters(false);
  }

  function closeCreateModal() {
    setIsCreateOpen(false);
    setFormError(null);
    if (openFromQuery) {
      const next = new URLSearchParams(searchParams);
      next.delete("create");
      setSearchParams(next, { replace: true });
    }
  }

  function openCreateModal() {
    setForm(buildInitialForm());
    setFormError(null);
    setIsCreateOpen(true);
  }

  async function handleCreateCandidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setFormError(null);

    try {
      await createCandidate({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        preferredDomain: form.preferredDomain,
        notes: form.notes.trim()
      });

      notify({ title: t("toast.candidateCreated"), variant: "success" });
      closeCreateModal();
      setReloadKey((value) => value + 1);
    } catch (caughtError) {
      setFormError(caughtError instanceof Error ? caughtError.message : "UNKNOWN_ERROR");
    } finally {
      setIsCreating(false);
    }
  }

  if (isLoading) return <Skeleton className="h-[540px]" />;
  if (error || !data) return <ErrorState message={getErrorMessage(error, t)} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.candidates.title")}
        actions={
          <Button onClick={openCreateModal}>
            {t("common.createCandidate")}
          </Button>
        }
      />

      <FilterToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder={locale === "ru" ? "Имя, email, роль или направление" : "Name, email, role or domain"}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((value) => !value)}
        activeCount={domainFilters.length + statusFilters.length}
        onReset={resetFilters}
      >
        <FilterGroup label={locale === "ru" ? "Направление" : "Domain"}>
          {DOMAIN_OPTIONS.map((domain) => (
            <FilterChip
              key={domain}
              label={t(`common.domains.${domain}`)}
              active={domainFilters.includes(domain)}
              onClick={() => toggleFilter(domain, setDomainFilters)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label={locale === "ru" ? "Статус" : "Status"}>
          {CANDIDATE_FILTER_STATUSES.map((status) => (
            <FilterChip
              key={status}
              label={t(`common.candidateStatus.${status}`)}
              active={statusFilters.includes(status)}
              onClick={() => toggleFilter(status, setStatusFilters)}
            />
          ))}
        </FilterGroup>
      </FilterToolbar>

      {filtered.length ? (
        <CandidateTable candidates={filtered} />
      ) : (
        <EmptyState
          title={locale === "ru" ? "Ничего не найдено" : "Nothing found"}
          description={locale === "ru" ? "Попробуйте изменить поиск или снять часть фильтров." : "Try adjusting the search or clearing some filters."}
        />
      )}

      <Modal
        open={isCreateOpen}
        title={locale === "ru" ? "Создать кандидата" : "Create candidate"}
        description={locale === "ru" ? "Новый участник появится в списке сразу после сохранения." : "The new participant will appear in the list right after saving."}
        onClose={closeCreateModal}
      >
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => void handleCreateCandidate(event)}>
          <Input
            required
            label={locale === "ru" ? "Имя" : "Full name"}
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
          />
          <Input
            required
            type="email"
            label={locale === "ru" ? "Эл. почта" : "Email"}
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <Select
            label={locale === "ru" ? "Направление" : "Domain"}
            value={form.preferredDomain}
            onChange={(event) => setForm((current) => ({ ...current, preferredDomain: event.target.value as DomainKey }))}
          >
            {DOMAIN_OPTIONS.map((domain) => (
              <option key={domain} value={domain}>
                {t(`common.domains.${domain}`)}
              </option>
            ))}
          </Select>
          <div className="sm:col-span-2">
            <Textarea
              label={locale === "ru" ? "Заметка" : "Note"}
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            />
          </div>
          {formError ? (
            <div className="sm:col-span-2">
              <ErrorState compact message={getErrorMessage(formError, t)} />
            </div>
          ) : null}
          <div className="sm:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeCreateModal}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? `${t("common.loading")}...` : t("admin.createCandidate.submit")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
