import { Outlet } from "react-router-dom";
import { BrandMark } from "@/components/brand/BrandMark";
import { LocaleToggle } from "@/components/common/LocaleToggle";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function PublicLayout() {
  return (
    <div className="surface-page">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-slate-950/75">
        <div className="page-shell flex items-center justify-between gap-4 py-4">
          <BrandMark />
          <div className="flex items-center gap-2">
            <LocaleToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="page-shell py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}
