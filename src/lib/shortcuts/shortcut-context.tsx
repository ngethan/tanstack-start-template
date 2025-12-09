import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { shortcutManager } from "./shortcut-manager";
import type { Shortcut } from "./types";

interface ShortcutContextValue {
	shortcuts: Shortcut[];
	userShortcuts:
		| Array<{
				shortcutId: string;
				keys: string[];
				enabled: boolean;
		  }>
		| undefined;
	registerShortcut: (shortcut: Shortcut) => void;
	unregisterShortcut: (id: string) => void;
	updateUserShortcuts: (
		shortcuts:
			| Array<{
					shortcutId: string;
					keys: string[];
					enabled: boolean;
			  }>
			| undefined,
	) => void;
	isRecording: boolean;
	startRecording: (callback: (keys: string[]) => void) => void;
	stopRecording: () => void;
}

const ShortcutContext = createContext<ShortcutContextValue | undefined>(
	undefined,
);

export function ShortcutProvider({ children }: { children: React.ReactNode }) {
	const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
	const [userShortcuts, setUserShortcuts] = useState<
		| Array<{
				shortcutId: string;
				keys: string[];
				enabled: boolean;
		  }>
		| undefined
	>(undefined);
	const [isRecording, setIsRecording] = useState(false);

	useEffect(() => {
		shortcutManager.init();

		return () => {
			shortcutManager.destroy();
		};
	}, []);

	const registerShortcut = useCallback((shortcut: Shortcut) => {
		shortcutManager.register(shortcut);
		setShortcuts(shortcutManager.getShortcuts());
	}, []);

	const unregisterShortcut = useCallback((id: string) => {
		shortcutManager.unregister(id);
		setShortcuts(shortcutManager.getShortcuts());
	}, []);

	const startRecording = useCallback((callback: (keys: string[]) => void) => {
		setIsRecording(true);
		shortcutManager.startRecording((keys) => {
			callback(keys);
			setIsRecording(false);
		});
	}, []);

	const stopRecording = useCallback(() => {
		setIsRecording(false);
		shortcutManager.stopRecording();
	}, []);

	const updateUserShortcuts = useCallback(
		(newUserShortcuts: typeof userShortcuts) => {
			setUserShortcuts(newUserShortcuts);
		},
		[],
	);

	return (
		<ShortcutContext.Provider
			value={{
				shortcuts,
				userShortcuts,
				registerShortcut,
				unregisterShortcut,
				updateUserShortcuts,
				isRecording,
				startRecording,
				stopRecording,
			}}
		>
			{children}
		</ShortcutContext.Provider>
	);
}

export function useShortcuts() {
	const context = useContext(ShortcutContext);
	if (!context) {
		throw new Error("useShortcuts must be used within a ShortcutProvider");
	}
	return context;
}
