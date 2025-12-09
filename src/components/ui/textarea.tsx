import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground flex min-h-[36px] w-full min-w-0 rounded-xl border px-3 py-2 text-base shadow-xs transition-all duration-200 outline-none resize-y disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				"border-gray-300 bg-gray-50",
				"hover:bg-gray-100 hover:border-gray-400",
				"focus:border-primary focus-visible:ring-1 focus-visible:ring-primary/30",
				"dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-xl",
				"dark:hover:bg-white/10 dark:hover:border-white/20",
				"dark:focus:border-white/20 dark:focus-visible:ring-white/20",
				"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
