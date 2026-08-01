import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/app/route-paths";
import { FilterChip, FilterGroup, FilterToolbar } from "@/components/admin/FilterToolbar";
import { DOMAIN_OPTIONS } from "@/config/status-options";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useI18n } from "@/hooks/useI18n";
import { getResults } from "@/services/admin.service";
import type { DomainKey } from "@/types/common";
import { Badge } from "@/ui/Badge";
import { buttonStyles } from "@/ui/Button";
import { EmptyState } from "@/ui/EmptyState";
import { ErrorState } from "@/ui/ErrorState";
import { PageHeader } from "@/ui/PageHeader";
import { ProgressBar } from "@/ui/ProgressBar";
import { Skeleton } from "@/ui/Skeleton";
import { formatDateTime, formatDecision, formatInterviewTitle } from "@/utils/format";
import { textOf } from "@/utils/i18n";
import { getErrorMessage } from "@/utils/errors";

type RiskKey = "low" | "medium" | "high";
type DecisionKey = "strong_yes" | "yes" | "mixed" | "no";
type SortMode = "updated_desc" | "score_desc" | "score_asc" | "risk_desc";

function resolveRisk(signals: Array<{ level: RiskKey }>) {
  if (signals.some((signal) => signal.level === "high")) return "high" as const;
  if (signals.some((signal) => signal.level === "medium")) return "medium" as const;
  return "low" as const;
}

export function ResultsPage() {
  const { locale, t } = useI18n();
  const { data, isLoading, error } = useAsyncData(() => getResults(), []);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [decisionFilters, setDecisionFilters] = useState<DecisionKey[]>([]);
  const [riskFilters, setRiskFilters] = useState<RiskKey[]>([]);
  const [domainFilters, setDomainFilters] = useState<DomainKey[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("updated_desc");

  const filteredData = useMemo(() => {
    if (!data) return [];

    const normalizedQuery = query.trim().toLowerCase();

    return data.filter((result) => {
      const risk = resolveRisk(result.antiCheatSignals);
      const matchesQuery =
        normalizedQuery.length === 0 ||
        result.candidateName.toLowerCase().includes(normalizedQuery) ||
        formatInterviewTitle(textOf(result.sectionTitle, locale)).toLowerCase().includes(normalizedQuery) ||
        formatDecision(result.decision, locale).toLowerCase().includes(normalizedQuery) ||
        t(`common.domains.${result.sectionDomain}`).toLowerCase().includes(normalizedQuery);

      const matchesDecision = decisionFilters.length === 0 || decisionFilters.includes(result.decision as DecisionKey);
      const matchesRisk = riskFilters.length === 0 || riskFilters.includes(risk);
      const matchesDomain = domainFilters.length === 0 || domainFilters.includes(result.sectionDomain);

      return matchesQuery && matchesDecision && matchesRisk && matchesDomain;
    });
  }, [data, decisionFilters, domainFilters, locale, query, riskFilters, t]);

  const sortedData = useMemo(() => {
    const riskScore: Record<RiskKey, number> = { low: 1, medium: 2, high: 3 };
    return [...filteredData].sort((left, right) => {
      if (sortMode === "score_desc") return right.overallScore - left.overallScore;
      if (sortMode === "score_asc") return left.overallScore - right.overallScore;
      if (sortMode === "risk_desc") {
        return riskScore[resolveRisk(right.antiCheatSignals)] - riskScore[resolveRisk(left.antiCheatSignals)];
      }
      return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
    });
  }, [filteredData, sortMode]);

  function toggleFilter<T extends string>(value: T, setter: (updater: (current: T[]) => T[]) => void) {
    setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  }

  function resetFilters() {
    setQuery("");
    setDecisionFilters([]);
    setRiskFilters([]);
    setDomainFilters([]);
    setShowFilters(false);
  }

  const activeFilterCount = decisionFilters.length + riskFilters.length + domainFilters.length;

  if (isLoading) return <Skeleton className="h-[620px]" />;
  if (error || !data) return <ErrorState message={getErrorMessage(error, t)} />;

  return (
    <div className="space-y-6">
      <PageHeader title={t("admin.results.title")} />

      <FilterToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder={locale === "ru" ? "Кандидат, интервью, решение" : "Candidate, interview, decision"}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((value) => !value)}
        activeCount={activeFilterCount}
        onReset={resetFilters}
      >
        <FilterGroup label={locale === "ru" ? "Решение" : "Decision"}>
          {(["strong_yes", "yes", "mixed", "no"] as DecisionKey[]).map((value) => (
            <FilterChip
              key={value}
              label={formatDecision(value, locale)}
              active={decisionFilters.includes(value)}
              onClick={() => toggleFilter(value, setDecisionFilters)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label={locale === "ru" ? "Риск" : "Risk"}>
          {(["low", "medium", "high"] as RiskKey[]).map((value) => (
            <FilterChip
              key={value}
              label={t(`common.risk.${value}`)}
              active={riskFilters.includes(value)}
              onClick={() => toggleFilter(value, setRiskFilters)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label={locale === "ru" ? "Дисциплина" : "Domain"}>
          {DOMAIN_OPTIONS.map((value) => (
            <FilterChip
              key={value}
              label={t(`common.domains.${value}`)}
              active={domainFilters.includes(value)}
              onClick={() => toggleFilter(value, setDomainFilters)}
            />
          ))}
        </FilterGroup>
      </FilterToolbar>

      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-subtle">
        <span>
          {locale === "ru"
            ? `Найдено: ${sortedData.length}${data.length !== sortedData.length ? ` из ${data.length}` : ""}`
            : `Found: ${sortedData.length}${data.length !== sortedData.length ? ` of ${data.length}` : ""}`}
        </span>

        <label className="inline-flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5" />
          <select
            className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-xs text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
          >
            <option value="updated_desc">{locale === "ru" ? "Сначала новые" : "Newest first"}</option>
            <option value="score_desc">{locale === "ru" ? "Балл: по убыванию" : "Score: high to low"}</option>
            <option value="score_asc">{locale === "ru" ? "Балл: по возрастанию" : "Score: low to high"}</option>
            <option value="risk_desc">{locale === "ru" ? "Риск: высокий к низкому" : "Risk: high to low"}</option>
          </select>
        </label>
      </div>

      {sortedData.length ? (
        <div className="overflow-hidden rounded-[28px] border border-slate-200/80 dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/80 text-sm dark:divide-white/10">
              <thead className="bg-slate-50/80 dark:bg-white/5">
                <tr>
                  {[
                    t("common.candidate"),
                    locale === "ru" ? "Дисциплина" : "Domain",
                    t("admin.results.score"),
                    t("admin.candidateDetail.antiCheat"),
                    t("common.viewReport")
                  ].map((label) => (
                    <th key={label} className="px-4 py-3 text-left font-medium text-subtle">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 bg-white/80 dark:divide-white/10 dark:bg-slate-900/70">
                {sortedData.map((result) => {
                  const risk = resolveRisk(result.antiCheatSignals);
                  return (
                    <tr key={result.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900 dark:text-white">{result.candidateName}</p>
                          <p className="text-xs text-subtle">{formatDateTime(result.updatedAt, locale)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-subtle">{t(`common.domains.${result.sectionDomain}`)}</td>
                      <td className="px-4 py-4">
                        <div className="min-w-[160px] space-y-2">
                          <div className="flex items-center justify-between text-xs text-subtle">
                            <span>{result.overallScore}%</span>
                            <span>{locale === "ru" ? "балл" : "score"}</span>
                          </div>
                          <ProgressBar value={result.overallScore} />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={risk === "high" ? "danger" : risk === "medium" ? "warning" : "success"}>
                          {t(`common.risk.${risk}`)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Link to={ROUTES.admin.report(result.sectionId)} className={buttonStyles({ variant: "outline", size: "sm" })}>
                          {t("common.viewReport")}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title={locale === "ru" ? "Ничего не найдено" : "Nothing found"}
          description={locale === "ru" ? "Попробуйте изменить запрос или сбросить фильтры." : "Try adjusting the search or clearing some filters."}
        />
      )}
    </div>
  );
}
