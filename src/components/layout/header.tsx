import { HeaderActions } from "@/components/layout/header-actions";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Notification } from "@/hooks/use-notifications";
import { Search } from "lucide-react";

interface HeaderProps {
	onSearchClick?: () => void;
	notifications?: Notification[];
	unreadCount?: number;
}

export function Header({
	onSearchClick,
	notifications = [],
	unreadCount = 0,
}: HeaderProps) {
	return (
		<header className="h-14 w-full bg-background rounded-t-xl border-b border-border flex items-center justify-between px-6">
			<div className="flex items-center gap-4 flex-1">
				<SidebarTrigger className="-ml-2" />

				<div
					className="relative max-w-md flex-1 cursor-pointer"
					onClick={onSearchClick}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							onSearchClick?.();
						}
					}}
				>
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5 z-10" />
					<Input
						type="text"
						placeholder="Search..."
						className="w-full pl-9 pr-12 cursor-pointer"
						readOnly
					/>
					<kbd className="absolute right-2 top-1/2 transform -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted/50 backdrop-blur px-1.5 text-[10px] font-medium text-muted-foreground border-white/10 font-mono">
						⌘K
					</kbd>
				</div>
			</div>

			<HeaderActions notifications={notifications} unreadCount={unreadCount} />
		</header>
	);
}
