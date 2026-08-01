import { Code2, Play } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/ui/Button";
import { Select } from "@/ui/Select";

export function MockCodeEditor({
  language,
  languages,
  code,
  editorKey,
  onLanguageChange,
  onCodeChange,
  onRun,
  isBusy
}: {
  language: string;
  languages: string[];
  code: string;
  editorKey?: string;
  onLanguageChange: (language: string) => void;
  onCodeChange: (value: string) => void;
  onRun: () => void;
  isBusy: boolean;
}) {
  const { t } = useI18n();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const lines = Math.max(12, code.split("\n").length + 2);
  const panelClass = isDark
    ? "overflow-hidden rounded-[28px] border border-white/10 bg-slate-950 shadow-[0_20px_60px_rgba(2,6,23,0.45)] transition-all duration-300"
    : "overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)] transition-all duration-300";
  const headerClass = isDark
    ? "flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-900/90 px-4 py-3 text-slate-50 backdrop-blur"
    : "flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-slate-900";
  const bodyClass = isDark
    ? "grid grid-cols-[56px_minmax(0,1fr)] bg-slate-950 text-slate-50 transition-all duration-300 ease-out"
    : "grid grid-cols-[56px_minmax(0,1fr)] bg-white text-slate-900 transition-all duration-300 ease-out";
  const lineNumberClass = isDark
    ? "select-none border-r border-white/10 px-3 py-4 text-right text-xs leading-7 text-slate-500"
    : "select-none border-r border-slate-200 px-3 py-4 text-right text-xs leading-7 text-slate-400";
  const textareaClass = isDark
    ? "min-h-[520px] w-full resize-none border-0 bg-transparent px-4 py-4 font-mono text-sm leading-7 text-slate-100 outline-none placeholder:text-slate-500 transition-all duration-200"
    : "min-h-[520px] w-full resize-none border-0 bg-transparent px-4 py-4 font-mono text-sm leading-7 text-slate-900 outline-none placeholder:text-slate-400 transition-all duration-200";
  const selectClass = isDark
    ? "border-white/15 bg-slate-900 text-slate-100 [color-scheme:dark]"
    : "border-slate-300 bg-white text-slate-900 [color-scheme:light]";
  const optionClass = isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900";

  return (
    <div className={panelClass}>
      <div className={headerClass}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={isDark ? "rounded-2xl bg-indigo-500/15 p-2 text-indigo-200" : "rounded-2xl bg-indigo-100 p-2 text-indigo-700"}>
            <Code2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{t("candidate.workspace.title")}</p>
            <p className={isDark ? "truncate text-xs text-slate-400" : "truncate text-xs text-slate-500"}>{t("candidate.workspace.leaveBody")}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[170px]">
            <Select className={selectClass} value={language} onChange={(event) => onLanguageChange(event.target.value)}>
              {languages.map((item) => (
                <option key={item} value={item} className={optionClass}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
          <Button size="sm" onClick={onRun} disabled={isBusy}>
            <Play className="h-4 w-4" />
            {t("common.runTests")}
          </Button>
        </div>
      </div>
      <div key={editorKey ?? `${language}:${code.length}`} className={bodyClass}>
        <div className={lineNumberClass}>
          {Array.from({ length: lines }).map((_, index) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>
        <textarea
          spellCheck={false}
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          className={textareaClass}
        />
      </div>
    </div>
  );
}
