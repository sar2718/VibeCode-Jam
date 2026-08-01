import { LogOut } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { BrandMark } from "@/components/brand/BrandMark";
import { LocaleToggle } from "@/components/common/LocaleToggle";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/ui/Button";
import { ROUTES } from "@/app/route-paths";

export function CandidateLayout() {
  const { logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="surface-page">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-slate-950/75">
        <div className="page-shell flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-6">
            <BrandMark />
          </div>
          <div className="flex items-center gap-2">
            <LocaleToggle />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void logout().then(() => navigate(ROUTES.home, { replace: true }));
              }}
            >
              <LogOut className="h-4 w-4" />
              {t("common.logout")}
            </Button>
          </div>
        </div>
      </header>
      <main className="page-shell py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
