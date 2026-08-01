import { AlertTriangle } from "lucide-react";
import { Link, useRouteError } from "react-router-dom";
import { ROUTES } from "@/app/route-paths";
import { useI18n } from "@/hooks/useI18n";
import { buttonStyles } from "@/ui/Button";
import { Card } from "@/ui/Card";

function getMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "statusText" in error && typeof (error as { statusText?: unknown }).statusText === "string") {
    return (error as { statusText: string }).statusText;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function AppErrorPage() {
  const { locale } = useI18n();
  const error = useRouteError();
  const title = locale === "ru" ? "Что-то пошло не так" : "Something went wrong";
  const description = locale === "ru"
    ? "Интерфейс не смог открыть страницу. Вернитесь на главную или обновите данные браузера."
    : "The interface could not open this page. Return home or refresh the browser data.";

  return (
    <div className="page-shell py-10">
      <Card className="mx-auto max-w-2xl">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-amber-500/15 p-3 text-amber-600 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-subtle">{description}</p>
            <p className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-subtle dark:border-white/10 dark:bg-white/5">
              {getMessage(error, description)}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={ROUTES.home} className={buttonStyles({ variant: "primary" })}>
                {locale === "ru" ? "На главную" : "Back home"}
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
