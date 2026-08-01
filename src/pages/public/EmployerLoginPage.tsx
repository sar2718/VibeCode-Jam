import { useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/route-paths";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { ErrorState } from "@/ui/ErrorState";
import { Input } from "@/ui/Input";
import { getErrorMessage } from "@/utils/errors";

export function EmployerLoginPage() {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const { locale, t } = useI18n();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await loginAdmin({ login, password });
      navigate(ROUTES.admin.root);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "UNKNOWN_ERROR");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card title={locale === "ru" ? "Вход администратора" : "Administrator sign in"}>
        <form className="mt-2 space-y-4" onSubmit={handleSubmit}>
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
          {error ? <ErrorState compact title={locale === "ru" ? "Ошибка входа" : "Sign-in error"} message={getErrorMessage(error, t)} /> : null}
          <Button type="submit" disabled={isSubmitting}>
            <LogIn className="h-4 w-4" />
            {isSubmitting ? `${t("common.loading")}...` : locale === "ru" ? "Войти" : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
