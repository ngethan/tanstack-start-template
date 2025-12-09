import { CommandPalette } from "@/components/command-palette";
import { Header } from "@/components/layout/header";
import { SidebarLayout } from "@/components/layout/sidebar";
import {
	adminNavigation,
	commandActions,
	mainNavigation,
} from "@/config/navigation";
import { useNotifications } from "@/hooks/use-notifications";
import { useTRPC } from "@/integrations/trpc/react";
import { useShortcutsInit } from "@/lib/shortcuts";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
	const [commandOpen, setCommandOpen] = useState(false);
	const { notifications, unreadCount } = useNotifications();
	const trpc = useTRPC();

	// Check if user is admin to show admin navigation
	const { data: userInfo } = useQuery(trpc.user.me.queryOptions());
	const isAdmin = userInfo?.role === "admin" || userInfo?.role === "owner";

	const navigation = useMemo(() => {
		if (isAdmin) {
			return [...mainNavigation, ...adminNavigation];
		}
		return mainNavigation;
	}, [isAdmin]);

	useShortcutsInit();

	return (
		<>
			<SidebarLayout
				navigation={navigation}
				logo={{
					src: "/logo.svg",
					alt: "Logo",
				}}
				brand={{
					name: "TanStack Starter",
					plan: "Premium Plan",
				}}
			>
				<div className="min-h-screen m-2 flex flex-col">
					<div className="rounded-xl border bg-background shadow-sm flex-1 flex flex-col overflow-hidden">
						<div className="sticky top-0 z-50 bg-background/40 backdrop-blur-md border-b">
							<Header
								onSearchClick={() => setCommandOpen(true)}
								notifications={notifications}
								unreadCount={unreadCount}
							/>
						</div>
						<div className="flex-1 overflow-auto">{children}</div>
					</div>
				</div>
			</SidebarLayout>

			<CommandPalette
				open={commandOpen}
				onOpenChange={setCommandOpen}
				navigationItems={mainNavigation}
				actions={commandActions}
			/>
		</>
	);
}
