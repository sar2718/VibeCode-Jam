import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/route-paths";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { ErrorState } from "@/ui/ErrorState";
import { Input } from "@/ui/Input";
import { getErrorMessage } from "@/utils/errors";

function extractInvitationHash(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const match = trimmed.match(/\/invite\/([^/?#]+)/i);
  if (match?.[1]) {
    return decodeURIComponent(match[1]);
  }

  return trimmed.replace(/^\//, "").replace(/\/?invite\//i, "").split(/[?#]/)[0].trim();
}

export function LandingPage() {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const { locale, t } = useI18n();
  const [mode, setMode] = useState<"candidate" | "admin">("candidate");
  const [keyInput, setKeyInput] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const invitationHash = useMemo(() => extractInvitationHash(keyInput), [keyInput]);

  useEffect(() => {
    if (mode !== "candidate") return;

    function isEditableTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return true;
      if (target.isContentEditable) return true;
      return Boolean(target.closest("[contenteditable='true']"));
    }

    function handlePasteShortcut(event: KeyboardEvent) {
      if (!((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v")) return;
      if (isEditableTarget(event.target)) return;

      event.preventDefault();
      void navigator.clipboard
        .readText()
        .then((value) => {
          if (value.trim()) setKeyInput(value.trim());
        })
        .catch(() => undefined);
    }

    function handleWindowPaste(event: ClipboardEvent) {
      if (isEditableTarget(event.target)) return;
      const value = event.clipboardData?.getData("text/plain") ?? "";
      if (!value.trim()) return;
      event.preventDefault();
      setKeyInput(value.trim());
    }

    window.addEventListener("keydown", handlePasteShortcut);
    window.addEventListener("paste", handleWindowPaste);
    return () => {
      window.removeEventListener("keydown", handlePasteShortcut);
      window.removeEventListener("paste", handleWindowPaste);
    };
  }, [mode]);

  async function handleAdminSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await loginAdmin({ login, password });
      navigate(ROUTES.admin.root);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "UNKNOWN_ERROR");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCandidateContinue() {
    if (!invitationHash) return;
    navigate(ROUTES.invitationByHash(invitationHash));
  }

  return (
    <div className="mx-auto max-w-[1240px]">
      <section className="surface-hero relative overflow-hidden rounded-[36px] px-8 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20 animate-fade-up">
        <div className="absolute inset-0 bg-grid opacity-25" />
        <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-8rem] right-[-6rem] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_460px] lg:items-center">
          <div className="max-w-4xl">
            <h1 className="text-[clamp(2.8rem,6.2vw,5rem)] font-semibold leading-[0.98] tracking-tight">
              {locale === "ru" ? "Вход в систему" : "Sign in"}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300/90">
              {locale === "ru"
                ? "Выберите роль и продолжите работу."
                : "Choose your role and continue."}
            </p>
            <div className="mt-8 h-px w-40 bg-gradient-to-r from-white/60 to-white/0" />
          </div>

          <Card className="p-6 sm:p-7 lg:p-8">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100/80 p-1 dark:bg-white/5">
              <button
                type="button"
                onClick={() => {
                  setMode("candidate");
                  setError(null);
                }}
                className={mode === "candidate" ? "rounded-2xl bg-white px-4 py-3 text-sm font-medium shadow-sm transition-all duration-300 dark:bg-white dark:text-slate-950" : "rounded-2xl px-4 py-3 text-sm font-medium text-subtle transition-all duration-300 hover:bg-white/50 dark:hover:bg-white/10"}
              >
                {locale === "ru" ? "Кандидат" : "Candidate"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("admin");
                  setError(null);
                }}
                className={mode === "admin" ? "rounded-2xl bg-white px-4 py-3 text-sm font-medium shadow-sm transition-all duration-300 dark:bg-white dark:text-slate-950" : "rounded-2xl px-4 py-3 text-sm font-medium text-subtle transition-all duration-300 hover:bg-white/50 dark:hover:bg-white/10"}
              >
                {locale === "ru" ? "Администратор" : "Administrator"}
              </button>
            </div>

            {mode === "candidate" ? (
              <form
                className="mt-5 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleCandidateContinue();
                }}
              >
                <Input
                  label={locale === "ru" ? "Ссылка или ключ доступа" : "Access link or key"}
                  value={keyInput}
                  onChange={(event) => setKeyInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();
                    handleCandidateContinue();
                  }}
                  placeholder={locale === "ru" ? "Например: INV-ABCD1234 или полная ссылка" : "Example: INV-ABCD1234 or a full link"}
                />
                <Button type="submit" fullWidth disabled={!invitationHash}>
                  {locale === "ru" ? "Продолжить" : "Continue"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <form className="mt-5 space-y-4" onSubmit={handleAdminSubmit}>
                <Input label={locale === "ru" ? "Логин" : "Login"} value={login} onChange={(event) => setLogin(event.target.value)} autoComplete="username" />
                <Input
                  label={locale === "ru" ? "Пароль" : "Password"}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="rounded-xl p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                      aria-label={showPassword ? (locale === "ru" ? "Скрыть пароль" : "Hide password") : (locale === "ru" ? "Показать пароль" : "Show password")}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
                {error ? <ErrorState compact message={getErrorMessage(error, t)} title={locale === "ru" ? "Ошибка входа" : "Sign-in error"} /> : null}
                <Button type="submit" fullWidth disabled={isSubmitting}>
                  {isSubmitting ? (locale === "ru" ? "Вход..." : "Signing in...") : locale === "ru" ? "Войти" : "Sign in"}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}

