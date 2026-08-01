import { SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/app/route-paths";
import { useI18n } from "@/hooks/useI18n";
import { Card } from "@/ui/Card";
import { buttonStyles } from "@/ui/Button";

export function NotFoundPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
      <Card className="w-full text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
          <SearchX className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">{t("notFound.title")}</h1>
        <p className="mt-3 text-sm text-subtle">{t("notFound.description")}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to={ROUTES.home} className={buttonStyles({ variant: "primary" })}>
            {t("notFound.action")}
          </Link>
        </div>
      </Card>
    </div>
  );
}
