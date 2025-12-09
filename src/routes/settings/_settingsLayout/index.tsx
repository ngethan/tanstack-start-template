import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/_settingsLayout/")({
	beforeLoad: () => {
		throw redirect({ to: "/settings/profile" });
	},
});
