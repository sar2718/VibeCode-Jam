import { useEffect, useState } from "react";
import { Download, Save } from "lucide-react";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { exportTaskBank, getSettings, saveSettings } from "@/services/admin.service";
import type { InterviewSettings } from "@/types/interview";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { ErrorState } from "@/ui/ErrorState";
import { Input } from "@/ui/Input";
import { PageHeader } from "@/ui/PageHeader";
import { Skeleton } from "@/ui/Skeleton";
import { downloadTextFile } from "@/utils/download";
import { textOf } from "@/utils/i18n";
import { getErrorMessage } from "@/utils/errors";

const weightLabels = {
  correctness: { ru: "Корректность", en: "Correctness" },
  optimality: { ru: "Оптимальность", en: "Optimality" },
  style: { ru: "Стиль кода", en: "Code style" },
  communication: { ru: "Объяснение решения", en: "Solution explanation" }
} as const;

export function SettingsPage() {
  const { locale, t } = useI18n();
  const { notify } = useToast();
  const { data, isLoading, error } = useAsyncData(() => getSettings(), []);
  const [settings, setSettings] = useState<InterviewSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data?.settings) {
      setSettings(data.settings);
    }
  }, [data]);

  async function handleSave() {
    if (!settings) {
      return;
    }

    setIsSaving(true);
    try {
      await saveSettings(settings);
      notify({ title: t("toast.settingsSaved"), variant: "success" });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDownload(domain: InterviewSettings["taskBankStats"][number]["domain"]) {
    const payload = await exportTaskBank(domain, locale);
    downloadTextFile(payload.filename, payload.content, payload.mimeType);
    notify({ title: locale === "ru" ? "Банк задач скачан" : "Task bank downloaded", variant: "success" });
  }

  if (isLoading) {
    return <Skeleton className="h-[700px]" />;
  }

  if (error || !data || !settings) {
    return <ErrorState message={getErrorMessage(error, t)} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.settings.title")}
        actions={
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? `${t("common.loading")}...` : t("common.save")}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card title={t("admin.settings.weights")}>
          <div className="space-y-5">
            {(Object.entries(settings.scoreWeights) as Array<[keyof InterviewSettings["scoreWeights"], number]>).map(([key, value]) => (
              <div key={key}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{weightLabels[key][locale]}</span>
                  <span className="text-subtle">{value}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={value}
                  onChange={(event) =>
                    setSettings((current) =>
                      current
                        ? {
                            ...current,
                            scoreWeights: {
                              ...current.scoreWeights,
                              [key]: Number(event.target.value)
                            }
                          }
                        : current
                    )
                  }
                  className="w-full accent-slate-950 dark:accent-white"
                />
              </div>
            ))}
          </div>
        </Card>

        <Card title={t("admin.settings.supportedLanguages")}>
          <div className="flex flex-wrap gap-2">
            {settings.supportedLanguages.map((language) => (
              <Badge key={language} variant="neutral">
                {language}
              </Badge>
            ))}
          </div>
          <div className="mt-6 space-y-4 rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
            <Input
              label={locale === "ru" ? "Количество задач в интервью" : "Number of tasks per interview"}
              type="number"
              min={1}
              max={10}
              value={String(settings.adaptivePolicy.maxTasksPerSection)}
              onChange={(event) =>
                setSettings((current) =>
                  current
                    ? {
                        ...current,
                        adaptivePolicy: {
                          ...current.adaptivePolicy,
                          maxTasksPerSection: Number(event.target.value || 1)
                        }
                      }
                    : current
                )
              }
            />
            <div className="space-y-2 text-sm text-subtle">
              <p>
                {locale === "ru" ? "Стартовая сложность:" : "Entry difficulty:"} {t(`common.difficulty.${settings.adaptivePolicy.entryDifficulty}`)}
              </p>
              <p>
                {locale === "ru" ? "Повышение при числе попыток до:" : "Promote when attempts are at most:"} {settings.adaptivePolicy.promoteWhenAttemptsAtMost}
              </p>
              <p>
                {locale === "ru" ? "Поддерживающий сценарий при попытках от:" : "Support path when attempts are at least:"} {settings.adaptivePolicy.supportWhenAttemptsAtLeast}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card title={t("admin.settings.antiCheatModules")}>
        <div className="grid gap-4 md:grid-cols-2">
          {settings.antiCheatModules.map((module) => (
            <div key={module.key} className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{textOf(module.label, locale)}</p>
                  <p className="mt-1 text-sm text-subtle">{textOf(module.threshold, locale)}</p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-subtle">
                  <input
                    type="checkbox"
                    checked={module.enabled}
                    onChange={(event) =>
                      setSettings((current) =>
                        current
                          ? {
                              ...current,
                              antiCheatModules: current.antiCheatModules.map((item) =>
                                item.key === module.key ? { ...item, enabled: event.target.checked } : item
                              )
                            }
                          : current
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  {module.enabled ? t("common.yes") : t("common.no")}
                </label>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title={t("admin.settings.taskBank")}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {settings.taskBankStats.map((item) => (
            <div key={item.domain} className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{t(`common.domains.${item.domain}`)}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="default">{item.count}</Badge>
                  <button
                    type="button"
                    onClick={() => void handleDownload(item.domain)}
                    className="rounded-xl border border-slate-200/80 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                    aria-label={locale === "ru" ? "Скачать банк задач" : "Download task bank"}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-subtle">{textOf(item.averageDifficulty, locale)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
