import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useShortcuts } from "./shortcuts/shortcut-context";
import type { Shortcut } from "./shortcuts/types";

export const shortcutDefinitions: Shortcut[] = [
	{
		id: "toggle-sidebar",
		name: "Toggle Sidebar",
		description: "Show or hide the sidebar",
		keys: ["meta", "b"],
		category: "Actions",
		enabled: true,
		customizable: true,
		global: false,
		action: () => {
			const trigger = document.querySelector(
				'[data-sidebar="trigger"]',
			) as HTMLButtonElement;
			trigger?.click();
		},
	},
	{
		id: "command",
		name: "Command",
		description: "Open the command palette",
		keys: ["meta", "k"],
		category: "Actions",
		enabled: true,
		customizable: true,
		global: true,
		action: () => {
			window.dispatchEvent(new Event("openCommandPalette"));
		},
	},
	{
		id: "settings",
		name: "Settings",
		description: "Open settings",
		keys: ["meta", ","],
		category: "Navigation",
		enabled: true,
		customizable: true,
		global: false,
		action: (ctx) => {
			ctx?.router.navigate({ to: "/settings/profile" });
		},
	},
];

export function useShortcutsInit() {
	const router = useRouter();
	const { registerShortcut, unregisterShortcut, updateUserShortcuts } =
		useShortcuts();
	const trpc = useTRPC();

	const { data: userShortcuts, isLoading } = useQuery({
		...trpc.shortcuts.getUserShortcuts.queryOptions(),
		retry: false,
		staleTime: 5 * 60 * 1000,
	});

	useEffect(() => {
		updateUserShortcuts(userShortcuts || []);
	}, [userShortcuts, updateUserShortcuts]);

	useEffect(() => {
		if (isLoading) return;

		for (const s of shortcutDefinitions) {
			unregisterShortcut(s.id);
		}

		for (const shortcut of shortcutDefinitions) {
			const userShortcut = userShortcuts?.find(
				(us) => us.shortcutId === shortcut.id,
			);

			const customized: Shortcut = {
				...shortcut,
				keys: (userShortcut?.keys as string[]) || shortcut.keys,
				enabled: userShortcut?.enabled ?? shortcut.enabled,
				action: (ctx) => shortcut.action(ctx || { router }),
			};

			if (customized.enabled) {
				registerShortcut(customized);
			}
		}

		return () => {
			for (const s of shortcutDefinitions) {
				unregisterShortcut(s.id);
			}
		};
	}, [router, registerShortcut, unregisterShortcut, userShortcuts, isLoading]);
}

export function getShortcutsForDisplay(
	userShortcuts?: Array<{
		shortcutId: string;
		keys: string[];
		enabled: boolean;
	}>,
) {
	return shortcutDefinitions.map((shortcut) => {
		const userShortcut = userShortcuts?.find(
			(us) => us.shortcutId === shortcut.id,
		);
		return {
			id: shortcut.id,
			name: shortcut.name,
			description: shortcut.description,
			keys: (userShortcut?.keys as string[]) || shortcut.keys,
			category: shortcut.category,
			enabled: userShortcut?.enabled ?? shortcut.enabled,
			customizable: shortcut.customizable,
			global: shortcut.global,
		};
	});
}

export function getShortcutKeys(
	shortcutId: string,
	userShortcuts?: Array<{
		shortcutId: string;
		keys: string[];
		enabled: boolean;
	}>,
): string[] | undefined {
	const shortcuts = getShortcutsForDisplay(userShortcuts);
	const shortcut = shortcuts.find((s) => s.id === shortcutId);
	return shortcut?.keys;
}
