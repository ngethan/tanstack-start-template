import { useTheme } from "@/components/theme-provider";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			toastOptions={{
				classNames: {
					toast:
						"group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
					description: "group-[.toast]:text-muted-foreground",
					actionButton:
						"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
					cancelButton:
						"group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
					error:
						"group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground group-[.toaster]:border-destructive/30",
					success:
						"group-[.toaster]:bg-primary/10 group-[.toaster]:text-primary group-[.toaster]:border-primary/30",
					warning:
						"group-[.toaster]:bg-warning/10 group-[.toaster]:text-warning group-[.toaster]:border-warning/30",
					info: "group-[.toaster]:bg-muted group-[.toaster]:border-muted-foreground/20",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
