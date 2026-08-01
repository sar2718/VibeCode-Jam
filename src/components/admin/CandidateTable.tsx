import { Link } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import type { Candidate } from "@/types/candidate";
import { ROUTES } from "@/app/route-paths";
import { Badge } from "@/ui/Badge";
import { Avatar } from "@/ui/Avatar";
import { textOf } from "@/utils/i18n";

export function CandidateTable({ candidates }: { candidates: Candidate[] }) {
  const { locale, t } = useI18n();

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200/80 dark:border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-slate-200/80 text-sm dark:divide-white/10">
          <colgroup>
            <col className="w-[29%]" />
            <col className="w-[18%]" />
            <col className="w-[15%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead className="bg-slate-50/80 dark:bg-white/5">
            <tr>
              {[
                t("common.candidate"),
                t("admin.createCandidate.targetRole"),
                locale === "ru" ? "Уровень по результатам" : "Level by results",
                t("admin.candidateDetail.score"),
                t("admin.candidateDetail.antiCheat"),
                locale === "ru" ? "Профиль" : "Profile"
              ].map((label) => (
                <th key={label} className="px-4 py-3 text-left font-medium text-subtle">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 bg-white/80 dark:divide-white/10 dark:bg-slate-900/70">
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={candidate.fullName} size="sm" />
                    <div>
                      <p className="font-medium">{candidate.fullName}</p>
                      <p className="text-xs text-subtle">{candidate.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-subtle">{textOf(candidate.targetRole, locale)}</td>
                <td className="px-4 py-4 text-subtle">
                  {candidate.inferredLevel ? t(`common.levels.${candidate.inferredLevel}`) : "—"}
                </td>
                <td className="px-4 py-4">{candidate.scoreAverage || "—"}</td>
                <td className="px-4 py-4">
                  <Badge variant={candidate.antiCheatRisk === "high" ? "danger" : candidate.antiCheatRisk === "medium" ? "warning" : "success"}>
                    {t(`common.risk.${candidate.antiCheatRisk}`)}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <Link className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-300" to={ROUTES.admin.candidate(candidate.id)}>
                    {t("common.viewCandidate")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
