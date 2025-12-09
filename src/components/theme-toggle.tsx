import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	function toggleTheme() {
		const prefersDark =
			typeof window !== "undefined" &&
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches;

		if (theme === "system") {
			setTheme(prefersDark ? "light" : "dark");
		} else {
			setTheme(theme === "dark" ? "light" : "dark");
		}
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			className="h-8 w-8 relative"
			onClick={toggleTheme}
		>
			<Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
			<Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
