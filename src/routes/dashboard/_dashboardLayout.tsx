import { DashboardLayout } from "@/layouts/dashboard-layout";
import { requireAuth } from "@/lib/auth/server";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/_dashboardLayout")({
	loader: async () => {
		await requireAuth();
		return {};
	},
	component: DashboardLayoutPage,
});

function DashboardLayoutPage() {
	return (
		<DashboardLayout>
			<Outlet />
		</DashboardLayout>
	);
}
