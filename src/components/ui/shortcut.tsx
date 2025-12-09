import { getShortcutKeys } from "@/lib/shortcuts";
import { useShortcuts } from "@/lib/shortcuts/shortcut-context";
import { formatKeyCombo } from "@/lib/shortcuts/types";
import { cn } from "@/lib/utils";
import {
	ArrowBigUp,
	ArrowDown,
	ArrowLeft,
	ArrowRight,
	ArrowUp,
	Command,
	Option,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ShortcutProps {
	keys: string[];
	className?: string;
	size?: "sm" | "md" | "lg";
}

export function Shortcut({ keys, className, size = "md" }: ShortcutProps) {
	const formattedKeys = formatKeyCombo(keys);

	const sizeClasses = {
		sm: "h-6 text-xs px-1.5",
		md: "h-8 text-xs px-2",
		lg: "h-10 text-sm px-3",
	};

	const iconSizes = {
		sm: "h-3 w-3",
		md: "h-3.5 w-3.5",
		lg: "h-4 w-4",
	};

	return (
		<kbd
			className={cn(
				"inline-flex items-center justify-center rounded-md border",
				"bg-gradient-to-b from-muted/50 to-muted/80",
				"border-border/50 shadow-sm",
				"font-mono font-medium",
				"text-foreground/80",
				sizeClasses[size],
				className,
			)}
		>
			{formattedKeys.flatMap((key, index) => [
				index > 0 && (
					<span key={`sep-${key}`} className="opacity-40 px-1">
						+
					</span>
				),
				<span key={`key-${key}`} className="inline-flex items-center">
					{key === "cmd" ? (
						<Command className={iconSizes[size]} strokeWidth={2} />
					) : key === "alt" ? (
						<Option className={iconSizes[size]} strokeWidth={2} />
					) : key === "shift" ? (
						<ArrowBigUp className={iconSizes[size]} strokeWidth={2} />
					) : key === "ctrl" ? (
						<span className="text-[0.9em]">CTRL</span>
					) : key === "↑" ? (
						<ArrowUp className={iconSizes[size]} strokeWidth={2} />
					) : key === "↓" ? (
						<ArrowDown className={iconSizes[size]} strokeWidth={2} />
					) : key === "←" ? (
						<ArrowLeft className={iconSizes[size]} strokeWidth={2} />
					) : key === "→" ? (
						<ArrowRight className={iconSizes[size]} strokeWidth={2} />
					) : (
						<span>{key}</span>
					)}
				</span>,
			])}
		</kbd>
	);
}

interface ShortcutHintProps {
	keys?: string[];
	shortcutId?: string;
	children: ReactNode;
	className?: string;
	side?: "top" | "bottom" | "left" | "right";
	delay?: number;
}

export function ShortcutHint({
	keys: propKeys,
	shortcutId,
	children,
	className,
	side = "bottom",
	delay = 1000,
}: ShortcutHintProps) {
	const [showTooltip, setShowTooltip] = useState(false);
	const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
	const triggerRef = useRef<HTMLDivElement>(null);
	const showTimeoutRef = useRef<NodeJS.Timeout>(null);
	const hideTimeoutRef = useRef<NodeJS.Timeout>(null);

	const { userShortcuts } = useShortcuts();

	const keys = shortcutId
		? getShortcutKeys(shortcutId, userShortcuts)
		: propKeys;

	if (!keys) return <>{children}</>;

	const handleMouseEnter = () => {
		if (hideTimeoutRef.current) {
			clearTimeout(hideTimeoutRef.current);
			hideTimeoutRef.current = null;
		}

		if (showTimeoutRef.current) {
			clearTimeout(showTimeoutRef.current);
		}

		showTimeoutRef.current = setTimeout(() => {
			if (triggerRef.current) {
				const rect = triggerRef.current.getBoundingClientRect();
				const offset = 8;

				let x = rect.left + rect.width / 2;
				let y = rect.top;

				switch (side) {
					case "top":
						y = rect.top - offset;
						break;
					case "bottom":
						y = rect.bottom + offset;
						break;
					case "left":
						x = rect.left - offset;
						y = rect.top + rect.height / 2;
						break;
					case "right":
						x = rect.right + offset;
						y = rect.top + rect.height / 2;
						break;
				}

				setTooltipPosition({ x, y });
				setShowTooltip(true);
			}
		}, delay);
	};

	const handleMouseLeave = () => {
		if (showTimeoutRef.current) {
			clearTimeout(showTimeoutRef.current);
			showTimeoutRef.current = null;
		}

		hideTimeoutRef.current = setTimeout(() => {
			setShowTooltip(false);
		}, 100);
	};

	useEffect(() => {
		return () => {
			if (hideTimeoutRef.current) {
				clearTimeout(hideTimeoutRef.current);
			}
			if (showTimeoutRef.current) {
				clearTimeout(showTimeoutRef.current);
			}
		};
	}, []);

	const positionClasses = {
		top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
		bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
		left: "right-full mr-2 top-1/2 -translate-y-1/2",
		right: "left-full ml-2 top-1/2 -translate-y-1/2",
	};

	return (
		<>
			<div
				ref={triggerRef}
				className={className}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				{children}
			</div>
			{showTooltip &&
				createPortal(
					<div
						className="fixed z-[99999] pointer-events-none"
						style={{
							left: `${tooltipPosition.x}px`,
							top: `${tooltipPosition.y}px`,
						}}
					>
						<div
							className={cn(
								"absolute animate-in fade-in-0 zoom-in-95",
								"duration-150",
								positionClasses[side],
							)}
						>
							<div
								className={cn(
									"relative overflow-hidden rounded-lg",
									"bg-white/90 dark:bg-zinc-900/90",
									"backdrop-blur-md",
									"border border-zinc-200 dark:border-zinc-800",
									"shadow-md",
									"px-3 py-2",
									"h-9 flex items-center",
								)}
							>
								<Shortcut keys={keys} size="sm" />
							</div>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}
