import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider.tsx";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 dark:border-white/10 dark:bg-white/5 dark:text-white light:border-neutral-200 light:bg-neutral-100 light:text-neutral-900 light:hover:bg-neutral-200"
        >
            {theme === "dark" ? (
                <>
                    <Sun className="h-4 w-4" />
                </>
            ) : (
                <>
                    <Moon className="h-4 w-4" />
                </>
            )}
        </button>
    );
}