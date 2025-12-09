import { Badge } from "@/components/ui/badge";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import type { CommandAction, NavigationItem } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

interface CommandPaletteProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	navigationItems: NavigationItem[];
	actions?: CommandAction[];
}

export function CommandPalette({
	open,
	onOpenChange,
	navigationItems,
	actions = [],
}: CommandPaletteProps) {
	const navigate = useNavigate();

	useEffect(() => {
		const handleOpen = () => onOpenChange(true);
		window.addEventListener("openCommandPalette", handleOpen);
		return () => window.removeEventListener("openCommandPalette", handleOpen);
	}, [onOpenChange]);

	const handleNavigate = (href: string) => {
		navigate({ to: href });
		onOpenChange(false);
	};

	const handleAction = (action: CommandAction) => {
		if (action.href) {
			handleNavigate(action.href);
		} else if (action.action) {
			action.action();
			onOpenChange(false);
		}
	};

	return (
		<CommandDialog open={open} onOpenChange={onOpenChange}>
			<CommandInput placeholder="Type a command or search..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Navigation">
					{navigationItems.map((item) => (
						<CommandItem
							key={item.href}
							onSelect={() => handleNavigate(item.href)}
						>
							<item.icon className="mr-2 h-4 w-4" />
							<span>{item.title}</span>
							{item.badge && (
								<Badge
									className={cn(
										"ml-auto",
										item.badge === "AI"
											? "bg-purple-500/10 text-purple-600"
											: "bg-emerald-500/10 text-emerald-600",
									)}
								>
									{item.badge}
								</Badge>
							)}
						</CommandItem>
					))}
				</CommandGroup>
				{actions.length > 0 && (
					<>
						<CommandSeparator />
						<CommandGroup heading="Actions">
							{actions.map((action) => (
								<CommandItem
									key={action.title}
									onSelect={() => handleAction(action)}
								>
									<action.icon className="mr-2 h-4 w-4" />
									<span>{action.title}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</>
				)}
			</CommandList>
		</CommandDialog>
	);
}
