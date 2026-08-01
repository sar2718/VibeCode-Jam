import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/ui/Button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { locale } = useI18n();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      aria-label={locale === "ru" ? "Сменить тему" : "Toggle theme"}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
