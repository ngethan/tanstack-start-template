import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Shortcut } from "@/components/ui/shortcut";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTRPC } from "@/integrations/trpc/react";
import type { UserShortcut } from "@/lib/db/schema/shortcuts";
import { getShortcutsForDisplay } from "@/lib/shortcuts";
import { useShortcuts } from "@/lib/shortcuts/shortcut-context";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Command, RefreshCw, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings/_settingsLayout/shortcuts")({
	component: ShortcutsSettings,
});

function ShortcutsSettings() {
	const [searchQuery, setSearchQuery] = useState("");
	const [recordingId, setRecordingId] = useState<string | null>(null);
	const [recordingShortcut, setRecordingShortcut] = useState<
		ReturnType<typeof getShortcutsForDisplay>[0] | null
	>(null);
	const [recordedKeys, setRecordedKeys] = useState<string[]>([]);
	const { startRecording, stopRecording } = useShortcuts();
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { data: userShortcuts } = useQuery(
		trpc.shortcuts.getUserShortcuts.queryOptions(),
	);

	const upsertShortcut = useMutation(
		trpc.shortcuts.upsertShortcut.mutationOptions({
			onMutate: async (variables) => {
				await queryClient.cancelQueries(
					trpc.shortcuts.getUserShortcuts.queryOptions(),
				);

				const previousShortcuts = queryClient.getQueryData(
					trpc.shortcuts.getUserShortcuts.queryOptions().queryKey,
				);

				queryClient.setQueryData<
					Omit<UserShortcut, "id" | "createdAt" | "updatedAt">[]
				>(trpc.shortcuts.getUserShortcuts.queryOptions().queryKey, (old) => {
					if (!old) return old;
					const existing = old.find(
						(s) => s.shortcutId === variables.shortcutId,
					);
					if (existing) {
						return old.map((s) =>
							s.shortcutId === variables.shortcutId
								? {
										...s,
										keys: variables.keys,
										enabled: variables.enabled ?? true,
									}
								: s,
						);
					}
					return [
						...old,
						{
							userId: "",
							shortcutId: variables.shortcutId,
							keys: variables.keys,
							enabled: variables.enabled ?? true,
						},
					];
				});

				return { previousShortcuts };
			},
			onError: (_err, _variables, context) => {
				if (context?.previousShortcuts) {
					queryClient.setQueryData(
						trpc.shortcuts.getUserShortcuts.queryOptions().queryKey,
						context.previousShortcuts,
					);
				}
			},
			onSettled: () => {
				queryClient.invalidateQueries(
					trpc.shortcuts.getUserShortcuts.queryOptions(),
				);
			},
		}),
	);

	const resetShortcutMutation = useMutation(
		trpc.shortcuts.resetShortcut.mutationOptions({
			onMutate: async (variables) => {
				await queryClient.cancelQueries(
					trpc.shortcuts.getUserShortcuts.queryOptions(),
				);

				const previousShortcuts = queryClient.getQueryData(
					trpc.shortcuts.getUserShortcuts.queryOptions().queryKey,
				);

				queryClient.setQueryData<
					Omit<UserShortcut, "id" | "createdAt" | "updatedAt">[]
				>(trpc.shortcuts.getUserShortcuts.queryOptions().queryKey, (old) => {
					if (!old) return old;
					return old.filter((s) => s.shortcutId !== variables.shortcutId);
				});

				return { previousShortcuts };
			},
			onError: (_err, _variables, context) => {
				if (context?.previousShortcuts) {
					queryClient.setQueryData(
						trpc.shortcuts.getUserShortcuts.queryOptions().queryKey,
						context.previousShortcuts,
					);
				}
			},
			onSettled: () => {
				queryClient.invalidateQueries(
					trpc.shortcuts.getUserShortcuts.queryOptions(),
				);
			},
		}),
	);

	const resetAllMutation = useMutation(
		trpc.shortcuts.resetAllShortcuts.mutationOptions({
			onMutate: async () => {
				await queryClient.cancelQueries(
					trpc.shortcuts.getUserShortcuts.queryOptions(),
				);

				const previousShortcuts = queryClient.getQueryData(
					trpc.shortcuts.getUserShortcuts.queryOptions().queryKey,
				);

				queryClient.setQueryData(
					trpc.shortcuts.getUserShortcuts.queryOptions().queryKey,
					[],
				);

				return { previousShortcuts };
			},
			onError: (_err, _variables, context) => {
				if (context?.previousShortcuts) {
					queryClient.setQueryData(
						trpc.shortcuts.getUserShortcuts.queryOptions().queryKey,
						context.previousShortcuts,
					);
				}
				toast.error("Failed to reset all shortcuts");
			},
			onSuccess: () => {
				toast.success("All shortcuts reset");
			},
			onSettled: () => {
				queryClient.invalidateQueries(
					trpc.shortcuts.getUserShortcuts.queryOptions(),
				);
			},
		}),
	);

	const shortcuts = getShortcutsForDisplay(userShortcuts || []);

	const groupedShortcuts = shortcuts.reduce(
		(acc, shortcut) => {
			const category = shortcut.category || "General";
			if (!acc[category]) acc[category] = [];
			acc[category].push(shortcut);
			return acc;
		},
		{} as Record<string, typeof shortcuts>,
	);

	const filteredGroups = Object.entries(groupedShortcuts).reduce(
		(acc, [category, items]) => {
			const filtered = items.filter(
				(item) =>
					item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.description?.toLowerCase().includes(searchQuery.toLowerCase()),
			);
			if (filtered.length > 0) {
				acc[category] = filtered;
			}
			return acc;
		},
		{} as typeof groupedShortcuts,
	);

	const handleRecord = (shortcut: (typeof shortcuts)[0]) => {
		setRecordingShortcut(shortcut);
		setRecordingId(shortcut.id);
		setRecordedKeys([]);
		startRecording((keys) => {
			setRecordedKeys(keys);
			stopRecording();
		});
	};

	const handleSaveRecording = async () => {
		if (recordingId && recordedKeys.length > 0) {
			const existingShortcut = shortcuts.find(
				(s) =>
					s.id !== recordingId &&
					s.keys.length === recordedKeys.length &&
					s.keys.every((key, i) => key === recordedKeys[i]),
			);

			if (existingShortcut) {
				toast.error(
					`Keyboard shortcut "${recordedKeys.join(" + ")}" is already assigned to "${existingShortcut.name}"`,
				);
				return;
			}

			handleCloseRecording();

			await upsertShortcut.mutateAsync({
				shortcutId: recordingId,
				keys: recordedKeys,
				enabled: true,
			});
		}
	};

	const handleCloseRecording = () => {
		setRecordingId(null);
		setRecordingShortcut(null);
		setRecordedKeys([]);
		stopRecording();
	};

	const handleToggle = async (shortcutId: string, enabled: boolean) => {
		const shortcut = shortcuts.find((s) => s.id === shortcutId);
		if (!shortcut) return;

		if (enabled) {
			const conflict = shortcuts.find(
				(s) =>
					s.id !== shortcutId &&
					s.enabled &&
					s.keys.length === shortcut.keys.length &&
					s.keys.every((key, i) => key === shortcut.keys[i]),
			);

			if (conflict) {
				toast.error(
					`Cannot enable: keyboard shortcut "${shortcut.keys.join(" + ")}" is already assigned to "${conflict.name}"`,
				);
				return;
			}
		}

		await upsertShortcut.mutateAsync({
			shortcutId,
			keys: shortcut.keys,
			enabled,
		});
	};

	const handleReset = async (shortcutId: string) => {
		const originals = getShortcutsForDisplay();
		const original = originals.find((s) => s.id === shortcutId);
		if (!original) return;

		// Check if the default keys are already in use by another shortcut
		const conflict = shortcuts.find(
			(s) =>
				s.id !== shortcutId &&
				s.enabled &&
				s.keys.length === original.keys.length &&
				s.keys.every((key, i) => key === original.keys[i]),
		);

		if (conflict) {
			toast.error(
				`Cannot reset: default keys "${original.keys.join(" + ")}" are already in use by "${conflict.name}"`,
			);
			return;
		}

		await resetShortcutMutation.mutateAsync({ shortcutId });
	};

	const handleResetAll = async () => {
		await resetAllMutation.mutateAsync();
	};

	return (
		<>
			<div className="rounded-lg border bg-card">
				<div className="p-4 sm:p-6 border-b">
					<div>
						<h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
							Keyboard Shortcuts
						</h2>
						<p className="text-sm sm:text-base text-muted-foreground mt-1">
							Customize keyboard shortcuts to match your workflow
						</p>
					</div>
				</div>

				<div className="p-4 sm:p-6 border-b bg-muted/30">
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
						<div className="relative flex-1 sm:max-w-md">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
							<Input
								placeholder="Search shortcuts..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9 bg-background"
							/>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={handleResetAll}
							className="bg-background w-full sm:w-auto"
						>
							<RefreshCw className="h-4 w-4 mr-2" />
							<span className="sm:hidden">Reset</span>
							<span className="hidden sm:inline">Reset All</span>
						</Button>
					</div>
				</div>

				<div className="p-4 sm:p-6">
					{Object.entries(filteredGroups).length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							No shortcuts found
						</div>
					) : (
						<div className="space-y-8">
							{Object.entries(filteredGroups).map(([category, items]) => (
								<div key={category}>
									<h3 className="text-sm font-medium text-muted-foreground mb-4">
										{category}
									</h3>
									<div className="space-y-2">
										{items.map((shortcut) => {
											const duplicateShortcut = shortcut.enabled
												? shortcuts.find(
														(s) =>
															s.id !== shortcut.id &&
															s.enabled &&
															s.keys.length === shortcut.keys.length &&
															s.keys.every(
																(key, i) => key === shortcut.keys[i],
															),
													)
												: null;
											const isDuplicate = !!duplicateShortcut;

											return (
												<div
													key={shortcut.id}
													className={cn(
														"group flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between p-3 sm:p-4 rounded-lg border transition-all",
														"hover:bg-accent/5 hover:border-accent/20",
														shortcut.customizable && "cursor-pointer",
														!shortcut.enabled && "opacity-60",
														isDuplicate &&
															"border-destructive/50 bg-destructive/5",
													)}
													onClick={() =>
														shortcut.customizable && handleRecord(shortcut)
													}
													onKeyDown={(e) => {
														if (
															(e.key === "Enter" || e.key === " ") &&
															shortcut.customizable
														) {
															e.preventDefault();
															handleRecord(shortcut);
														}
													}}
													role={shortcut.customizable ? "button" : undefined}
													tabIndex={shortcut.customizable ? 0 : undefined}
												>
													<div className="flex-1 space-y-1">
														<div className="flex items-center gap-2 flex-wrap">
															<span className="font-medium text-sm">
																{shortcut.name}
															</span>
															{shortcut.global && (
																<Badge
																	variant="outline"
																	className="text-[10px] px-1.5 py-0"
																>
																	GLOBAL
																</Badge>
															)}
															{isDuplicate && (
																<TooltipProvider>
																	<Tooltip>
																		<TooltipTrigger asChild>
																			<AlertCircle className="h-4 w-4 text-destructive" />
																		</TooltipTrigger>
																		<TooltipContent>
																			<p>
																				Duplicate shortcut with "
																				{duplicateShortcut?.name}"
																			</p>
																		</TooltipContent>
																	</Tooltip>
																</TooltipProvider>
															)}
														</div>
														{shortcut.description && (
															<p className="text-xs text-muted-foreground">
																{shortcut.description}
															</p>
														)}
													</div>

													<div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
														<div className="flex items-center gap-2">
															{shortcut.customizable && (
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-8 w-8 sm:opacity-0 group-hover:opacity-100 transition-opacity"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleReset(shortcut.id);
																	}}
																>
																	<RefreshCw className="h-3.5 w-3.5" />
																</Button>
															)}

															<div className="flex justify-end">
																<Shortcut keys={shortcut.keys} size="sm" />
															</div>
														</div>

														<Switch
															checked={shortcut.enabled}
															onCheckedChange={(checked) =>
																handleToggle(shortcut.id, checked)
															}
															onClick={(e) => e.stopPropagation()}
															className="data-[state=checked]:bg-primary"
														/>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			<Dialog
				open={!!recordingShortcut}
				onOpenChange={() => handleCloseRecording()}
			>
				<DialogContent
					className="sm:max-w-md"
					onEnterPress={handleSaveRecording}
					enterPressDisabled={recordedKeys.length === 0}
				>
					<DialogHeader>
						<DialogTitle>Record Shortcut</DialogTitle>
						<DialogDescription>
							Press the key combination for "{recordingShortcut?.name}"
						</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col items-center py-8 space-y-6">
						<div className="relative">
							<div
								className={cn(
									"flex items-center justify-center min-h-[60px] min-w-[200px] px-8 py-4",
									"rounded-xl border-2 border-dashed",
									"bg-muted/30",
									recordedKeys.length > 0
										? "border-primary"
										: "border-muted-foreground/30",
								)}
							>
								{recordedKeys.length > 0 ? (
									<Shortcut keys={recordedKeys} size="lg" />
								) : (
									<div className="flex flex-col items-center space-y-2">
										<Command className="h-8 w-8 text-muted-foreground animate-pulse" />
										<span className="text-sm text-muted-foreground">
											Listening for keys...
										</span>
									</div>
								)}
							</div>
						</div>

						{recordingShortcut?.keys && (
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<span>Current:</span>
								<Shortcut keys={recordingShortcut.keys} size="sm" />
							</div>
						)}
					</div>

					<div className="flex justify-between">
						<Button variant="outline" onClick={handleCloseRecording}>
							Cancel
						</Button>
						<div className="flex gap-2">
							{recordedKeys.length > 0 && (
								<Button
									variant="outline"
									onClick={() => {
										setRecordedKeys([]);
										startRecording((keys) => {
											setRecordedKeys(keys);
											stopRecording();
										});
									}}
								>
									<RefreshCw className="h-4 w-4 mr-2" />
									Retry
								</Button>
							)}
							<Button
								onClick={handleSaveRecording}
								disabled={recordedKeys.length === 0}
							>
								Save Shortcut
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
