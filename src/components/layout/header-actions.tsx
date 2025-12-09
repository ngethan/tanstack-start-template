import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAccountDropdown } from "@/components/user-account-dropdown";
import type { Notification } from "@/hooks/use-notifications";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";

interface HeaderActionsProps {
	notifications?: Notification[];
	unreadCount?: number;
	showThemeToggle?: boolean;
	showNotifications?: boolean;
	showUserAccount?: boolean;
}

export function HeaderActions({
	notifications = [],
	unreadCount = 0,
	showThemeToggle = true,
	showNotifications = true,
	showUserAccount = true,
}: HeaderActionsProps) {
	const { data: session } = authClient.useSession();

	return (
		<div className="flex items-center gap-2">
			{showThemeToggle && <ThemeToggle />}

			{showNotifications && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="relative h-8 w-8">
							<Bell className="w-4 h-4" />
							{unreadCount > 0 && (
								<span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-medium">
									{unreadCount}
								</span>
							)}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-80">
						<DropdownMenuLabel>Notifications</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{notifications.length === 0 ? (
							<div className="p-4 text-center text-sm text-muted-foreground">
								No notifications
							</div>
						) : (
							notifications.map((notification) => (
								<DropdownMenuItem
									key={notification.id}
									className="flex flex-col items-start p-3 cursor-pointer"
								>
									<div className="flex items-start justify-between w-full">
										<p
											className={cn(
												"text-sm flex-1",
												notification.unread
													? "font-medium text-foreground"
													: "text-muted-foreground",
											)}
										>
											{notification.message}
										</p>
										{notification.unread && (
											<div className="w-2 h-2 bg-destructive rounded-full ml-2 mt-1" />
										)}
									</div>
									<span className="text-xs text-muted-foreground mt-1">
										{notification.time}
									</span>
								</DropdownMenuItem>
							))
						)}
						{notifications.length > 0 && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem className="text-center justify-center text-sm text-foreground">
									View all notifications
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			)}

			{showUserAccount && session && (
				<>
					<div className="h-4 w-px bg-border mx-1" />
					<div className="hidden md:block">
						<UserAccountDropdown minimized={true} />
					</div>
				</>
			)}

			{!session && (
				<>
					<Button asChild variant="ghost" size="sm" className="h-8">
						<Link to="/login">Log in</Link>
					</Button>
					<Button asChild size="sm" className="h-8">
						<Link to="/signup">Sign up</Link>
					</Button>
				</>
			)}
		</div>
	);
}
