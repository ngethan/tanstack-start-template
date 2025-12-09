import type { useRouter } from "@tanstack/react-router";

export interface Shortcut {
	id: string;
	name: string;
	description?: string;
	keys: string[];
	category?: string;
	enabled?: boolean;
	customizable?: boolean;
	global?: boolean; // Whether the shortcut works across all pages
	action: (ctx?: {
		router: ReturnType<typeof useRouter>;
	}) => void | Promise<void>;
}

export interface ShortcutCategory {
	id: string;
	name: string;
	description?: string;
}

export type KeyCombo = {
	key: string;
	ctrl?: boolean;
	alt?: boolean;
	shift?: boolean;
	meta?: boolean; // Cmd on Mac, Windows key on Windows
};

export function formatKeyCombo(keys: string[]): string[] {
	const isMac =
		typeof window !== "undefined" &&
		navigator.userAgent.toUpperCase().indexOf("MAC") >= 0;

	return keys.map((key) => {
		if (key === "meta" || key === "cmd") {
			return isMac ? "cmd" : "Ctrl";
		}
		if (key === "alt") {
			return isMac ? "alt" : "Alt";
		}
		if (key === "shift") {
			return isMac ? "shift" : "Shift";
		}
		if (key === "ctrl") {
			return isMac ? "ctrl" : "Ctrl";
		}

		if (key === "escape") return "ESC";
		if (key === "enter") return "ENTER";
		if (key === "backspace") return "BACKSPACE";
		if (key === "delete") return "DELETE";
		if (key === "space") return "SPACE";
		if (key === "tab") return "TAB";
		if (key === "arrowup" || key === "up") return "↑";
		if (key === "arrowdown" || key === "down") return "↓";
		if (key === "arrowleft" || key === "left") return "←";
		if (key === "arrowright" || key === "right") return "→";

		return key.toUpperCase();
	});
}

export function parseKeyboardEvent(event: KeyboardEvent): KeyCombo {
	return {
		key: event.key.toLowerCase(),
		ctrl: event.ctrlKey,
		alt: event.altKey,
		shift: event.shiftKey,
		meta: event.metaKey,
	};
}

export function keyComboToArray(combo: KeyCombo): string[] {
	const keys: string[] = [];

	if (combo.meta) keys.push("meta");
	if (combo.ctrl) keys.push("ctrl");
	if (combo.alt) keys.push("alt");
	if (combo.shift) keys.push("shift");
	keys.push(combo.key);

	return keys;
}

export function matchesShortcut(event: KeyboardEvent, keys: string[]): boolean {
	const combo = parseKeyboardEvent(event);
	const eventKeys = keyComboToArray(combo);

	const normalizedEventKeys = eventKeys.map((k) => k.toLowerCase());
	const normalizedKeys = keys.map((k) => k.toLowerCase());

	if (normalizedEventKeys.length !== normalizedKeys.length) return false;

	return (
		normalizedEventKeys.every((key) => normalizedKeys.includes(key)) &&
		normalizedKeys.every((key) => normalizedEventKeys.includes(key))
	);
}
