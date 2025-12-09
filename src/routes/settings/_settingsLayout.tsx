import { CommandPalette } from "@/components/command-palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { UserAccountDropdown } from "@/components/user-account-dropdown";
import { mainNavigation } from "@/config/navigation";
import { requireAuth } from "@/lib/auth/server";
import { cn } from "@/lib/utils";
import {
	Link,
	Outlet,
	createFileRoute,
	useLocation,
} from "@tanstack/react-router";
import {
	ArrowLeft,
	Bell,
	Building,
	CreditCard,
	Globe,
	Key,
	Keyboard,
	type LucideIcon,
	Menu,
	Palette,
	Shield,
	User,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/settings/_settingsLayout")({
	loader: async () => {
		await requireAuth();
		return {};
	},
	component: SettingsLayout,
});

interface SettingsNavItem {
	title: string;
	href: string;
	icon: LucideIcon;
	description?: string;
	badge?: string;
	separator?: boolean;
	disabled?: boolean;
}

const settingsNavigation: SettingsNavItem[] = [
	{
		title: "Profile",
		href: "/settings/profile",
		icon: User,
		description: "Your personal information",
	},
	{
		title: "Authentication",
		href: "/settings/authentication",
		icon: Shield,
		description: "Security and login methods",
	},
	{
		title: "Notifications",
		href: "/settings/notifications",
		icon: Bell,
		description: "Email and push notifications",
		disabled: true,
	},
	{
		title: "Appearance",
		href: "/settings/appearance",
		icon: Palette,
		description: "Theme and display preferences",
		disabled: true,
	},
	{
		title: "Shortcuts",
		href: "/settings/shortcuts",
		icon: Keyboard,
		description: "Keyboard shortcuts",
		badge: "New",
	},
	{
		separator: true,
		title: "Billing",
		href: "/settings/billing",
		icon: CreditCard,
		description: "Subscription and payment",
		disabled: true,
	},
	{
		title: "Team",
		href: "/settings/team",
		icon: Users,
		description: "Manage team members",
		disabled: true,
	},
	{
		title: "Organization",
		href: "/settings/organization",
		icon: Building,
		description: "Organization settings",
		disabled: true,
	},
	{
		title: "Integrations",
		href: "/settings/integrations",
		icon: Globe,
		description: "Third-party connections",
		disabled: true,
	},
	{
		title: "API Keys",
		href: "/settings/api-keys",
		icon: Key,
		description: "Developer access",
		disabled: true,
	},
];

function SettingsLayout() {
	const [commandOpen, setCommandOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const location = useLocation();

	useEffect(() => {
		setMobileMenuOpen(false);
	}, []);

	const currentPage = settingsNavigation.find(
		(item) => location.pathname === item.href,
	);

	return (
		<>
			<div className="min-h-screen bg-muted/30">
				<header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="container mx-auto px-4 sm:px-6">
						<div className="flex h-14 items-center justify-between">
							<div className="flex items-center gap-3 flex-1">
								<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
									<SheetTrigger asChild>
										<Button variant="ghost" size="icon" className="lg:hidden">
											<Menu className="h-5 w-5" />
											<span className="sr-only">Toggle menu</span>
										</Button>
									</SheetTrigger>
									<SheetContent side="left" className="w-80">
										<SheetHeader>
											<SheetTitle>Settings</SheetTitle>
										</SheetHeader>
										<nav className="mt-6 space-y-1">
											{settingsNavigation.map((item, index) => (
												<div key={item.href}>
													{item.separator && index > 0 && (
														<div className="my-3 border-t" />
													)}
													<Link
														to={item.href}
														onClick={() => setMobileMenuOpen(false)}
														className={cn(
															"group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-accent/50",
															"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
															item.disabled && "opacity-50 cursor-not-allowed",
														)}
														activeProps={{
															className:
																"bg-accent text-accent-foreground font-medium",
														}}
														disabled={item.disabled}
													>
														<item.icon className="mt-0.5 h-4 w-4 text-muted-foreground group-data-[active]:text-accent-foreground" />
														<div className="flex-1">
															<div className="flex items-center gap-2">
																<span className="font-medium">
																	{item.title}
																</span>
																{item.badge && (
																	<span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
																		{item.badge}
																	</span>
																)}
															</div>
															{item.description && (
																<p className="mt-0.5 text-xs text-muted-foreground">
																	{item.description}
																</p>
															)}
														</div>
													</Link>
												</div>
											))}
										</nav>
									</SheetContent>
								</Sheet>

								<div>
									<h1 className="text-lg sm:text-xl font-semibold">Settings</h1>
									{currentPage && (
										<p className="text-xs text-muted-foreground lg:hidden">
											{currentPage.title}
										</p>
									)}
								</div>
							</div>

							<div className="flex items-center gap-2">
								<ThemeToggle />

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="relative h-8 w-8"
										>
											<Bell className="w-4 h-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-80">
										<DropdownMenuLabel>Notifications</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<div className="p-4 text-center text-sm text-muted-foreground">
											No notifications
										</div>
									</DropdownMenuContent>
								</DropdownMenu>

								<div className="hidden sm:block h-4 w-px bg-border mx-2 sm:mx-3" />

								<UserAccountDropdown minimized={true} />
							</div>
						</div>
					</div>
				</header>

				<div className="container mx-auto px-4 sm:px-6 mt-4 sm:mt-6">
					<Link
						to="/dashboard"
						className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
						<span className="hidden sm:inline">Back to Dashboard</span>
						<span className="sm:hidden">Back</span>
					</Link>
				</div>

				<div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
					<div className="flex gap-8">
						<aside className="hidden lg:block w-72 shrink-0">
							<nav className="sticky top-24 space-y-1">
								{settingsNavigation.map((item, index) => (
									<div key={item.href}>
										{item.separator && index > 0 && (
											<div className="my-3 border-t" />
										)}
										<Link
											to={item.href}
											className={cn(
												"group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-accent/50",
												"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
												item.disabled && "opacity-50 cursor-not-allowed",
											)}
											activeProps={{
												className:
													"bg-accent text-accent-foreground font-medium",
											}}
											disabled={item.disabled}
										>
											<item.icon className="mt-0.5 h-4 w-4 text-muted-foreground group-data-[active]:text-accent-foreground" />
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<span className="font-medium">{item.title}</span>
													{item.badge && (
														<span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
															{item.badge}
														</span>
													)}
												</div>
												{item.description && (
													<p className="mt-0.5 text-xs text-muted-foreground">
														{item.description}
													</p>
												)}
											</div>
										</Link>
									</div>
								))}
							</nav>
						</aside>

						<main className="flex-1 min-w-0">
							<Outlet />
						</main>
					</div>
				</div>
			</div>

			<CommandPalette
				open={commandOpen}
				onOpenChange={setCommandOpen}
				navigationItems={mainNavigation}
			/>
		</>
	);
}
