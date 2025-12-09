import type { Shortcut } from "./types";
import { matchesShortcut } from "./types";

export class ShortcutManager {
	private shortcuts: Map<string, Shortcut> = new Map();
	private listeners: Set<(event: KeyboardEvent) => void> = new Set();
	private isRecording = false;
	private recordCallback: ((keys: string[]) => void) | null = null;

	register(shortcut: Shortcut): void {
		if (shortcut.enabled !== false) {
			this.shortcuts.set(shortcut.id, shortcut);
		} else {
			this.shortcuts.delete(shortcut.id);
		}
	}

	unregister(id: string): void {
		this.shortcuts.delete(id);
	}

	updateKeys(id: string, keys: string[]): void {
		const shortcut = this.shortcuts.get(id);
		if (shortcut) {
			shortcut.keys = keys;
		}
	}

	setEnabled(id: string, enabled: boolean): void {
		const shortcut = this.shortcuts.get(id);
		if (shortcut) {
			shortcut.enabled = enabled;
			if (!enabled) {
				this.shortcuts.delete(id);
			}
		}
	}

	getShortcuts(): Shortcut[] {
		return Array.from(this.shortcuts.values());
	}

	getShortcutsByCategory(category: string): Shortcut[] {
		return Array.from(this.shortcuts.values()).filter(
			(s) => s.category === category,
		);
	}

	startRecording(callback: (keys: string[]) => void): void {
		this.isRecording = true;
		this.recordCallback = callback;
	}

	stopRecording(): void {
		this.isRecording = false;
		this.recordCallback = null;
	}

	handleKeyDown(event: KeyboardEvent): boolean {
		// If recording, capture the keys
		if (this.isRecording && this.recordCallback) {
			event.preventDefault();

			const keys: string[] = [];
			if (event.metaKey) keys.push("meta");
			if (event.ctrlKey && !event.metaKey) keys.push("ctrl"); // Don't add ctrl if meta is pressed on Mac
			if (event.altKey) keys.push("alt");
			if (event.shiftKey) keys.push("shift");

			// Only add the actual key if it's not just a modifier
			if (!["Control", "Alt", "Shift", "Meta", "Command"].includes(event.key)) {
				keys.push(event.key.toLowerCase());
				this.recordCallback(keys);
				this.stopRecording();
			}

			return true;
		}

		// Check if any shortcut matches
		for (const shortcut of this.shortcuts.values()) {
			if (shortcut.enabled !== false && matchesShortcut(event, shortcut.keys)) {
				event.preventDefault();
				shortcut.action();
				return true;
			}
		}

		return false;
	}

	init(): void {
		const handler = (event: KeyboardEvent) => {
			// Don't trigger shortcuts when typing in inputs
			const target = event.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.contentEditable === "true"
			) {
				// Unless it's a global shortcut or we're recording
				if (!this.isRecording) {
					const isGlobalShortcut = Array.from(this.shortcuts.values()).some(
						(s) => s.global && matchesShortcut(event, s.keys),
					);
					if (!isGlobalShortcut) return;
				}
			}

			this.handleKeyDown(event);
		};

		document.addEventListener("keydown", handler);
		this.listeners.add(handler);
	}
	destroy(): void {
		for (const handler of this.listeners) {
			document.removeEventListener("keydown", handler);
		}
		this.listeners.clear();
		this.shortcuts.clear();
	}
}

export const shortcutManager = new ShortcutManager();
