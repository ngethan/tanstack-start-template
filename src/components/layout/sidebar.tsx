import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	useSidebar,
} from "@/components/ui/sidebar";
import { UserAccountDropdown } from "@/components/user-account-dropdown";
import type { NavigationItem } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

interface AppSidebarProps {
	navigation: NavigationItem[];
	logo?: {
		src: string;
		alt: string;
	};
	brand?: {
		name: string;
		plan?: string;
	};
}

export function AppSidebar({
	navigation,
	logo = {
		src: "/logo.svg",
		alt: "Logo",
	},
	brand = {
		name: "TanStack Starter",
		plan: "Premium Plan",
	},
}: AppSidebarProps) {
	const location = useLocation();
	const currentPath = location.pathname;
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

	return (
		<Sidebar
			collapsible="icon"
			className="border-none bg-muted p-2"
			style={
				{
					"--sidebar-width-icon": "4.5rem",
				} as React.CSSProperties
			}
		>
			<SidebarHeader className={cn("p-2 pb-4 bg-muted")}>
				<div className={cn("flex items-center", !isCollapsed && "gap-3")}>
					<img
						src={logo.src}
						alt={logo.alt}
						className="w-8 h-8 flex-shrink-0"
					/>
					{!isCollapsed && (
						<div>
							<h1 className="text-lg font-semibold text-foreground tracking-tight overflow-hidden whitespace-nowrap">
								{brand.name}
							</h1>
						</div>
					)}
				</div>
			</SidebarHeader>

			<SidebarContent className="bg-muted border-none">
				<SidebarGroup className="p-0">
					<SidebarGroupContent>
						<SidebarMenu className="px-2">
							{navigation.map((item) => {
								const isActive = currentPath === item.href;
								return (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											tooltip={item.title}
										>
											<Link to={item.href}>
												<item.icon
													className={cn(
														"transition-colors",
														isActive
															? "text-sidebar-accent-foreground"
															: "text-muted-foreground",
													)}
												/>
												<span className="group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden">
													{item.title}
												</span>
												{item.isExternal && (
													<ExternalLink className="ml-auto h-3 w-3 text-muted-foreground group-data-[collapsible=icon]:hidden" />
												)}
												{item.badge && (
													<SidebarMenuBadge
														className={cn(
															"ml-auto group-data-[collapsible=icon]:hidden",
															item.badge === "AI"
																? "bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400"
																: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400",
														)}
													>
														{item.badge}
													</SidebarMenuBadge>
												)}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="p-2 border-t dark:border-white/5 bg-muted">
				<UserAccountDropdown
					minimized={isCollapsed}
					className="px-0 py-2 h-10 has-[>svg]:px-0"
				/>
			</SidebarFooter>
		</Sidebar>
	);
}

export function SidebarLayout({
	children,
	navigation,
	logo,
	brand,
}: {
	children: React.ReactNode;
	navigation: NavigationItem[];
	logo?: {
		src: string;
		alt: string;
	};
	brand?: {
		name: string;
		plan?: string;
	};
}) {
	return (
		<SidebarProvider>
			<div className="flex h-screen w-full">
				<AppSidebar navigation={navigation} logo={logo} brand={brand} />
				<div className="flex-1 flex flex-col bg-muted overflow-hidden">
					{children}
				</div>
			</div>
		</SidebarProvider>
	);
}
