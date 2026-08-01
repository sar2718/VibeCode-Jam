import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3, TerminalSquare } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/app/route-paths";
import { MockCodeEditor } from "@/components/candidate/MockCodeEditor";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useAuth } from "@/hooks/useAuth";
import { useCountdown } from "@/hooks/useCountdown";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { advanceTask, getSectionBundle, runTests, saveDraft, submitSection } from "@/services/candidate.service";
import type { Task } from "@/types/task";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { ErrorState } from "@/ui/ErrorState";
import { Modal } from "@/ui/Modal";
import { Skeleton } from "@/ui/Skeleton";
import { formatInterviewTitle } from "@/utils/format";
import { textOf } from "@/utils/i18n";
import { getErrorMessage } from "@/utils/errors";

const outcomeCopy = {
  ru: {
    promote: "Следующая задача будет сложнее.",
    maintain: "Следующая задача останется на сопоставимом уровне.",
    support: "Следующая задача будет проще или с большей поддержкой."
  },
  en: {
    promote: "The next task will be harder.",
    maintain: "The next task stays at a comparable level.",
    support: "The next task will be easier or more supportive."
  }
} as const;

type PendingAction = "next" | "finish" | null;

const languageFallbacks: Record<string, string> = {
  TypeScript: "function solve(input: string): string {\n  return input;\n}\n",
  JavaScript: "function solve(input) {\n  return input;\n}\n",
  Python: "def solve(input_data: str) -> str:\n    return input_data\n",
  Java: "public final class Solution {\n  public static String solve(String input) {\n    return input;\n  }\n}\n",
  Go: "package main\n\nfunc solve(input string) string {\n\treturn input\n}\n",
  Rust: "fn solve(input: &str) -> String {\n    input.to_string()\n}\n",
  Kotlin: "fun solve(input: String): String {\n    return input\n}\n",
  Swift: "func solve(_ input: String) -> String {\n    return input\n}\n",
  "C++": "#include <string>\n\nstd::string solve(const std::string& input) {\n  return input;\n}\n",
  "C#": "public static class Solution {\n  public static string Solve(string input) {\n    return input;\n  }\n}\n",
  SQL: "-- write your query here\nSELECT 1;\n",
  Bash: "#!/usr/bin/env bash\n# write your solution here\n",
  YAML: "service:\n  name: app\n",
  Scala: "def solve(input: String): String = {\n  input\n}\n",
  "HTML/CSS": "<div class=\"solution\"></div>\n\n<style>\n.solution {\n  display: block;\n}\n</style>\n"
};

function getStarterCode(task: Task | undefined, language: string) {
  if (!task) return "";
  return task.starterCode[language] ?? languageFallbacks[language] ?? Object.values(task.starterCode)[0] ?? "";
}

function buildRunOutput(
  language: string,
  task: Task | undefined,
  summary:
    | {
        visibleTestsPassed: number;
        visibleTestsTotal: number;
        attempts: number;
        status: string;
        lastRunAt?: string;
      }
    | undefined,
  locale: "ru" | "en"
) {
  if (!summary?.lastRunAt) return [] as string[];
  const statusLine =
    summary.status === "passed"
      ? locale === "ru"
        ? "Статус: решение прошло видимые проверки"
        : "Status: solution passed visible checks"
      : locale === "ru"
        ? "Статус: решение требует доработки"
        : "Status: solution needs another pass";

  return [
    locale === "ru" ? `$ ${language} > запуск тестов` : `$ ${language} > test run`,
    task ? `${locale === "ru" ? "Задача" : "Task"}: ${textOf(task.title, locale)}` : "",
    statusLine,
    locale === "ru"
      ? `Видимые тесты: ${summary.visibleTestsPassed}/${summary.visibleTestsTotal}`
      : `Visible checks: ${summary.visibleTestsPassed}/${summary.visibleTestsTotal}`,
    locale === "ru" ? `Попытка: ${summary.attempts}` : `Attempt: ${summary.attempts}`
  ].filter(Boolean);
}

export function CandidateSolvePage() {
  const params = useParams();
  const navigate = useNavigate();
  const { session, setActiveSectionId } = useAuth();
  const { locale, t } = useI18n();
  const { notify } = useToast();
  const sectionId = params.sectionId ?? session?.activeSectionId ?? "";
  const [reloadKey, setReloadKey] = useState(0);
  const [language, setLanguage] = useState("TypeScript");
  const [code, setCode] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [autoFinished, setAutoFinished] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [localReady, setLocalReady] = useState(false);
  const [codeSeedKey, setCodeSeedKey] = useState("");

  const { data, isLoading, error } = useAsyncData(() => getSectionBundle(sectionId), [sectionId, reloadKey]);
  const countdown = useCountdown(data?.section.runtime.sessionEndsAt);

  const currentSummary = useMemo(() => {
    if (!data?.currentTask) return undefined;
    return data.result.taskResults.find((item) => item.taskId === data.currentTask?.id);
  }, [data]);

  const progress = useMemo(() => {
    if (!data?.section) return 0;
    const completedTaskIds = Array.isArray(data.section.runtime.completedTaskIds) ? data.section.runtime.completedTaskIds : [];
    const solved = completedTaskIds.length + (currentSummary?.status === "passed" ? 1 : 0);
    return Math.round((solved / Math.max(data.section.taskPool.maxTasks, 1)) * 100);
  }, [currentSummary, data]);

  const isLastTask = useMemo(() => {
    if (!data?.section) return false;
    const completedTaskIds = Array.isArray(data.section.runtime.completedTaskIds) ? data.section.runtime.completedTaskIds : [];
    return completedTaskIds.length + 1 >= data.section.taskPool.maxTasks;
  }, [data]);

  useEffect(() => {
    if (!data?.currentTask) return;
    const preferredLanguage =
      currentSummary?.language && data.section.languageOptions.includes(currentSummary.language)
        ? currentSummary.language
        : data.section.languageOptions[0] ?? "TypeScript";
    const starter = currentSummary?.codeDraft ?? getStarterCode(data.currentTask, preferredLanguage);
    setLanguage(preferredLanguage);
    setCode(starter);
    setCodeSeedKey(`${data.currentTask.id}:${preferredLanguage}:${starter}`);
    setLocalReady(Boolean(currentSummary?.codeDraft || currentSummary?.lastRunAt || currentSummary?.attempts));
  }, [data?.currentTask?.id, data?.section.languageOptions, currentSummary?.language, currentSummary?.codeDraft, currentSummary?.lastRunAt, currentSummary?.attempts]);

  useEffect(() => {
    if (!sectionId) return;
    setActiveSectionId(sectionId);
  }, [sectionId, setActiveSectionId]);

  useEffect(() => {
    if (!countdown.isExpired || autoFinished || !data || data.section.status !== "in_progress") return;
    setAutoFinished(true);
    void (async () => {
      await submitSection(sectionId);
      navigate(ROUTES.candidate.complete(sectionId), { replace: true });
    })();
  }, [autoFinished, countdown.isExpired, data, navigate, sectionId]);

  function handleLanguageChange(nextLanguage: string) {
    if (!data?.currentTask) return;
    const nextCode =
      currentSummary?.language === nextLanguage && currentSummary.codeDraft
        ? currentSummary.codeDraft
        : getStarterCode(data.currentTask, nextLanguage);
    setLanguage(nextLanguage);
    setCode(nextCode);
    setCodeSeedKey(`${data.currentTask.id}:${nextLanguage}:${nextCode}`);
  }

  async function persistDraft() {
    if (!data?.currentTask) return;
    await saveDraft(sectionId, data.currentTask.id, { language, code });
  }

  async function handleRun() {
    if (!data?.currentTask) return;
    setIsBusy(true);
    setActionError(null);
    try {
      await runTests(sectionId, data.currentTask.id, { language, code });
      setLocalReady(true);
      setReloadKey((value) => value + 1);
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "UNKNOWN_ERROR");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSaveDraft() {
    if (!data?.currentTask) return;
    setIsBusy(true);
    setActionError(null);
    try {
      await persistDraft();
      setLocalReady(true);
      notify({ title: locale === "ru" ? "Черновик сохранён" : "Draft saved", variant: "success" });
      setReloadKey((value) => value + 1);
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "UNKNOWN_ERROR");
    } finally {
      setIsBusy(false);
    }
  }

  async function confirmProgress() {
    if (!data?.currentTask) return;
    setIsBusy(true);
    setActionError(null);
    try {
      await persistDraft();
      if (pendingAction === "finish") {
        await submitSection(sectionId);
        navigate(ROUTES.candidate.complete(sectionId));
        return;
      }
      const decision = await advanceTask(sectionId);
      if (decision.shouldFinish || !decision.nextTaskId) {
        await submitSection(sectionId);
        navigate(ROUTES.candidate.complete(sectionId));
        return;
      }
      notify({ title: outcomeCopy[locale][decision.outcome], variant: "success" });
      setReloadKey((value) => value + 1);
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "UNKNOWN_ERROR");
    } finally {
      setIsBusy(false);
      setPendingAction(null);
    }
  }

  if (!sectionId) return <Navigate to={ROUTES.candidate.root} replace />;
  if (isLoading) return <Skeleton className="h-[760px]" />;
  if (error || !data) return <ErrorState title={locale === "ru" ? "Интервью" : "Interview"} message={getErrorMessage(error, t)} />;
  if (data.section.status === "completed" || data.result.finalStatus === "submitted" || data.result.finalStatus === "reviewed") {
    return <Navigate to={ROUTES.candidate.complete(sectionId)} replace />;
  }
  if (data.section.status !== "in_progress") return <Navigate to={ROUTES.candidate.root} replace />;

  const task = data.currentTask;
  const hasCheckpoint =
    !!task &&
    !!currentSummary &&
    (
      Boolean(currentSummary.codeDraft?.trim()) ||
      Boolean(currentSummary.lastRunAt) ||
      currentSummary.attempts > 0 ||
      currentSummary.status === "passed" ||
      localReady ||
      data.readyForNextStep
    );
  const nextButtonLabel = isLastTask
    ? locale === "ru"
      ? "Завершить интервью"
      : "Finish interview"
    : locale === "ru"
      ? "Перейти к следующей задаче"
      : "Save and continue";

  const modalTitle =
    pendingAction === "finish" || isLastTask
      ? locale === "ru"
        ? "Завершить интервью"
        : "Finish interview"
      : locale === "ru"
        ? "Перейти к следующей задаче"
        : "Go to the next task";
  const modalDescription =
    pendingAction === "finish" || isLastTask
      ? locale === "ru"
        ? "Текущее решение сохранится, интервью завершится, и вернуться к задачам будет нельзя."
        : "The current solution will be saved, the interview will be finished, and you will not be able to return to these tasks."
      : locale === "ru"
        ? "Текущее решение сохранится, откроется следующая задача, и вернуться к этой задаче будет нельзя."
        : "The current solution will be saved, the next task will open, and you will no longer be able to return to this task.";

  const runOutput = buildRunOutput(language, task, currentSummary, locale);

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-slate-200/80 bg-white/80 px-5 py-4 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">{locale === "ru" ? "Техническое интервью" : "Technical interview"}</p>
              <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight">{task ? textOf(task.title, locale) : formatInterviewTitle(textOf(data.section.title, locale))}</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-subtle">
            <Badge variant="default">{t(`common.difficulty.${task?.difficulty ?? "medium"}`)}</Badge>
            <Badge variant="info"><Clock3 className="mr-1 h-3.5 w-3.5" />{countdown.label}</Badge>
            <Badge variant="neutral">{progress}%</Badge>
          </div>
        </div>
        <Button variant="dangerOutline" onClick={() => setPendingAction("finish")} disabled={isBusy}>
          {locale === "ru" ? "Завершить интервью" : "Finish interview"}
        </Button>
      </div>

      {actionError ? <ErrorState compact message={getErrorMessage(actionError, t)} /> : null}

      {task ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="min-w-0 overflow-hidden rounded-[20px] border border-slate-200/80 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
            <div className="max-h-[calc(100vh-220px)] space-y-6 overflow-y-auto px-5 py-5">
              <div className="space-y-2">
                <p className="text-sm leading-7 text-subtle whitespace-pre-line">{textOf(task.statement, locale)}</p>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-subtle">{locale === "ru" ? "Формат" : "Format"}</h2>
                <div className="space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-200">
                  <p><span className="font-semibold">{locale === "ru" ? "Ввод:" : "Input:"}</span> {textOf(task.inputFormat, locale)}</p>
                  <p><span className="font-semibold">{locale === "ru" ? "Вывод:" : "Output:"}</span> {textOf(task.outputFormat, locale)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-subtle">{locale === "ru" ? "Примеры" : "Examples"}</h2>
                <div className="space-y-4">
                  {task.examples.map((example, index) => (
                    <div key={`${task.id}-${index}`} className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                        {locale === "ru" ? `Пример ${index + 1}` : `Example ${index + 1}`}
                      </p>
                      <div className="space-y-3">
                        <div className="min-w-0">
                          <p className="mb-1 text-xs font-medium text-subtle">{locale === "ru" ? "Ввод" : "Input"}</p>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs leading-6 text-slate-900 whitespace-pre-wrap break-words dark:border-white/10 dark:bg-slate-950 dark:text-slate-100">
                            {example.input}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="mb-1 text-xs font-medium text-subtle">{locale === "ru" ? "Вывод" : "Output"}</p>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs leading-6 text-slate-900 whitespace-pre-wrap break-words dark:border-white/10 dark:bg-slate-950 dark:text-slate-100">
                            {example.output}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-subtle">{textOf(example.explanation, locale)}</p>
                      {index < task.examples.length - 1 ? (
                        <div className="border-t border-slate-200/70 pt-1 dark:border-white/10" />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-subtle">{locale === "ru" ? "Ограничения" : "Constraints"}</h2>
                <ul className="space-y-2 text-sm text-subtle">
                  {task.constraints.map((item, index) => (
                    <li key={`${task.id}-constraint-${index}`}>- {textOf(item, locale)}</li>
                  ))}
                </ul>
              </div>

              {task.hints.length ? (
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-subtle">{locale === "ru" ? "Подсказки" : "Hints"}</h2>
                  <ul className="space-y-2 text-sm text-subtle">
                    {task.hints.map((item, index) => (
                      <li key={`${task.id}-hint-${index}`}>- {textOf(item, locale)}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>

          <section className="min-w-0 space-y-4">
            <MockCodeEditor
              language={language}
              languages={data.section.languageOptions}
              code={code}
              editorKey={codeSeedKey}
              onLanguageChange={handleLanguageChange}
              onCodeChange={setCode}
              onRun={() => void handleRun()}
              isBusy={isBusy}
            />

            <Card title={locale === "ru" ? "Консоль" : "Console"}>
              <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950">
                <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-xs uppercase tracking-[0.16em] text-slate-500 dark:border-white/10 dark:text-slate-400">
                  <TerminalSquare className="h-4 w-4" />
                  {locale === "ru" ? "Вывод запуска" : "Run output"}
                </div>
                <div className="space-y-2 px-4 py-4 font-mono text-xs leading-6 text-slate-900 dark:text-slate-100">
                  {runOutput.length ? (
                    runOutput.map((line) => <div key={line}>{line}</div>)
                  ) : (
                    <p className="font-sans text-sm text-subtle">
                      {locale === "ru" ? "Запустите тесты, чтобы увидеть результат компиляции и проверок." : "Run tests to see compile and check output."}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <div className="rounded-[20px] border border-slate-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-950/70">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-subtle">
                  {hasCheckpoint
                    ? isLastTask
                      ? locale === "ru"
                        ? "Текущее решение сохранится и интервью завершится."
                        : "The current solution will be saved and the interview will be completed."
                      : locale === "ru"
                        ? "Текущее решение сохранится, после чего откроется следующая задача."
                        : "The current solution will be saved and the next task will open."
                    : locale === "ru"
                      ? "Сначала сохраните черновик или запустите тесты."
                      : "Save a draft or run tests first."}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => void handleSaveDraft()} disabled={isBusy}>
                    {locale === "ru" ? "Сохранить черновик" : "Save draft"}
                  </Button>
                  <Button onClick={() => setPendingAction(isLastTask ? "finish" : "next")} disabled={isBusy || !hasCheckpoint}>
                    {nextButtonLabel}
                    {!isLastTask ? <ArrowRight className="h-4 w-4" /> : null}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <EmptyState
          title={locale === "ru" ? "Интервью завершено" : "Interview completed"}
          description={locale === "ru" ? "Ответы сохранены." : "Your answers were saved."}
          actionLabel={locale === "ru" ? "Завершить интервью" : "Finish interview"}
          onAction={() => setPendingAction("finish")}
        />
      )}

      <Modal
        open={!!pendingAction}
        title={modalTitle}
        description={modalDescription}
        onClose={() => setPendingAction(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setPendingAction(null)}>
              {t("common.cancel")}
            </Button>
            <Button variant="danger" onClick={() => void confirmProgress()} disabled={isBusy}>
              {pendingAction === "finish" || isLastTask
                ? locale === "ru"
                  ? "Завершить интервью"
                  : "Finish interview"
                : locale === "ru"
                  ? "Перейти к следующей задаче"
                  : "Go to next task"}
            </Button>
          </>
        }
      >
        <div className="rounded-[24px] border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
          {locale === "ru"
            ? "После подтверждения текущий шаг будет зафиксирован, и вернуться к нему нельзя."
            : "After confirmation, the current step will be locked and you will not be able to return to it."}
        </div>
      </Modal>
    </div>
  );
}
