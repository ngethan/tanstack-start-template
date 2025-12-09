import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
	HelpCircle,
	LayoutDashboard,
	Loader2,
	LogOut,
	MoreVertical,
	Settings,
	User,
} from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { memo } from "react";
import { toast } from "sonner";
import { BugReportDialog } from "./bug-report-dialog";

interface UserAccountDropdownProps {
	minimized?: boolean;
	className?: string;
}

export const UserAccountDropdown = memo(function UserAccountDropdown({
	minimized = false,
	className,
}: UserAccountDropdownProps) {
	const posthog = usePostHog();
	const navigate = useNavigate();
	const { user, isLoading } = useAuth();

	const handleLogout = async () => {
		try {
			await authClient.signOut();
			posthog?.capture("logged_out");
			toast.success("Successfully logged out");
			navigate({ to: "/login" });
		} catch (error) {
			console.error("Logout error:", error);
			toast.error("Failed to log out. Please try again.");
		}
	};

	if (isLoading) {
		return (
			<Button
				variant="ghost"
				size="icon"
				className={cn("h-9 w-9 rounded-lg", className)}
				disabled
			>
				<Loader2 className="h-4 w-4 animate-spin" />
			</Button>
		);
	}

	if (!user) {
		return null;
	}

	if (minimized) {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className={cn(
							"h-8 w-8 rounded-full focus-visible:ring-0 justify-start hover:bg-transparent dark:hover:bg-transparent",
							className,
						)}
					>
						<Avatar className="h-8 w-8">
							{user.avatar && (
								<img
									src={user.avatar}
									alt={user.name}
									loading="eager"
									className="aspect-square size-full rounded-full object-cover"
								/>
							)}
							{!user.avatar && (
								<AvatarFallback className="text-xs bg-muted">
									{user.initials}
								</AvatarFallback>
							)}
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent data-side="right" align="end" className="w-56">
					<DropdownMenuLabel>
						<div className="flex items-center gap-3">
							<Avatar className="h-8 w-8">
								{user.avatar && (
									<img
										src={user.avatar}
										alt={user.name}
										loading="eager"
										className="aspect-square size-full rounded-full object-cover"
									/>
								)}
								{!user.avatar && (
									<AvatarFallback className="text-xs bg-muted">
										{user.initials}
									</AvatarFallback>
								)}
							</Avatar>
							<div className="flex flex-col space-y-1">
								<p className="text-sm font-medium leading-none">{user.name}</p>
								<p className="text-xs leading-none text-muted-foreground">
									{user.email}
								</p>
							</div>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
						<LayoutDashboard className="mr-2 h-4 w-4" />
						<span>Dashboard</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => navigate({ to: "/dashboard/profile" })}
					>
						<User className="mr-2 h-4 w-4" />
						<span>Profile</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						<HelpCircle className="mr-2 h-4 w-4" />
						<span>Help & Support</span>
					</DropdownMenuItem>
					<DropdownMenuItem asChild className="focus:bg-green-500">
						<BugReportDialog />
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
						<Settings className="mr-2 h-4 w-4" />
						<span>Settings</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="text-destructive cursor-pointer"
						onClick={handleLogout}
					>
						<LogOut className="mr-2 h-4 w-4" />
						<span>Log out</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className={cn(
						"w-full justify-between h-auto px-3 py-2 hover:bg-sidebar-accent dark:hover:bg-sidebar-accent",
						className,
					)}
				>
					<div className="flex items-center gap-3 min-w-0 p-1">
						<Avatar className="h-8 w-8 flex-shrink-0">
							{user.avatar && (
								<img
									src={user.avatar}
									alt={user.name}
									loading="eager"
									className="aspect-square size-full rounded-full object-cover"
								/>
							)}
							{!user.avatar && (
								<AvatarFallback className="text-xs bg-muted">
									{user.initials}
								</AvatarFallback>
							)}
						</Avatar>
						<div className="text-left min-w-0 overflow-hidden">
							<p className="text-sm font-medium text-foreground truncate">
								{user.name}
							</p>
							<p className="text-xs text-muted-foreground truncate">
								{user.email}
							</p>
						</div>
					</div>
					<MoreVertical className="h-4 w-4 text-muted-foreground" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent side="right" align="end" className="w-56">
				<DropdownMenuLabel>
					<div className="flex items-center gap-3 min-w-0">
						<Avatar className="h-8 w-8 flex-shrink-0">
							{user.avatar && (
								<img
									src={user.avatar}
									alt={user.name}
									loading="eager"
									className="aspect-square size-full rounded-full object-cover"
								/>
							)}
							{!user.avatar && (
								<AvatarFallback className="text-xs bg-muted">
									{user.initials}
								</AvatarFallback>
							)}
						</Avatar>
						<div className="text-left min-w-0 overflow-hidden">
							<p className="text-sm font-medium text-foreground truncate">
								{user.name}
							</p>
							<p className="text-xs text-muted-foreground truncate">
								{user.email}
							</p>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
					<LayoutDashboard className="mr-2 h-4 w-4" />
					<span>Dashboard</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => navigate({ to: "/dashboard/profile" })}
				>
					<User className="mr-2 h-4 w-4" />
					<span>Profile</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<HelpCircle className="mr-2 h-4 w-4" />
					<span>Help & Support</span>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<BugReportDialog />
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
					<Settings className="mr-2 h-4 w-4" />
					<span>Settings</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="text-destructive cursor-pointer"
					onClick={handleLogout}
				>
					<LogOut className="mr-2 h-4 w-4" />
					<span>Log out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
});
