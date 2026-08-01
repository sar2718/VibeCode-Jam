import { BarChart3, ClipboardList, LogOut, Settings, Users } from "lucide-react";
import type { ComponentType } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BrandMark } from "@/components/brand/BrandMark";
import { LocaleToggle } from "@/components/common/LocaleToggle";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/ui/Button";
import { ROUTES } from "@/app/route-paths";
import { cn } from "@/utils/cn";

type NavItem = {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
  end?: boolean;
  isActive?: (pathname: string) => boolean;
};

export function AdminLayout() {
  const { logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const items: NavItem[] = [
    {
      label: t("nav.sections"),
      to: ROUTES.admin.root,
      icon: ClipboardList,
      end: true,
      isActive: (pathname: string) => pathname === ROUTES.admin.root || pathname.startsWith(ROUTES.admin.sections)
    },
    { label: t("nav.candidates"), to: ROUTES.admin.candidates, icon: Users },
    { label: t("nav.results"), to: ROUTES.admin.results, icon: BarChart3 },
    { label: t("nav.settings"), to: ROUTES.admin.settings, icon: Settings }
  ];

  return (
    <div className="surface-page">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200/70 bg-white/70 px-5 py-6 backdrop-blur dark:border-white/10 dark:bg-slate-950/75">
          <BrandMark />
          <nav className="mt-8 space-y-1.5">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => {
                    const resolvedActive = item.isActive?.(location.pathname) ?? isActive;
                    return cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
                      resolvedActive && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white dark:bg-white dark:text-slate-950"
                    );
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-slate-950/75">
            <div className="page-shell flex flex-wrap items-center justify-end gap-4 py-4">
              <div className="ml-auto flex items-center gap-2">
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
      </div>
    </div>
  );
}
