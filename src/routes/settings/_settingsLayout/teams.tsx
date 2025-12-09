import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/_settingsLayout/teams")({
	component: ShortcutsSettings,
});

function ShortcutsSettings() {
	return (
		<div className="rounded-lg border bg-card">
			<div className="p-6 border-b">
				<div>
					<h2 className="text-2xl font-semibold tracking-tight">Teams</h2>
					<p className="text-muted-foreground">Manage your teams</p>
				</div>
			</div>
			<div className="p-6">
				<div className="flex items-center justify-center py-12 text-muted-foreground">
					<p>Teams configuration coming soon...</p>
				</div>
			</div>
		</div>
	);
}
