import { env } from "@/env";
import { useEffect, useRef } from "react";

declare global {
	interface Window {
		turnstile: {
			render: (
				container: string | HTMLElement,
				options: {
					sitekey: string;
					callback?: (token: string) => void;
					"error-callback"?: () => void;
					"expired-callback"?: () => void;
					theme?: "light" | "dark" | "auto";
					size?: "normal" | "compact" | "invisible";
					appearance?: "always" | "execute" | "interaction-only";
				},
			) => string;
			reset: (widgetId: string) => void;
			remove: (widgetId: string) => void;
			execute: (widgetId: string) => void;
		};
	}
}

interface TurnstileProps {
	onVerify: (token: string) => void;
	onError?: () => void;
	onExpire?: () => void;
	theme?: "light" | "dark" | "auto";
	size?: "normal" | "compact" | "invisible";
	appearance?: "always" | "execute" | "interaction-only";
}

export function Turnstile({
	onVerify,
	onError,
	onExpire,
	theme = "auto",
	size = "invisible",
	appearance = "interaction-only",
}: TurnstileProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const widgetIdRef = useRef<string | null>(null);

	useEffect(() => {
		if (!env.VITE_TURNSTILE_SITE_KEY) {
			console.warn("Turnstile site key not configured");
			return;
		}

		const script = document.createElement("script");
		script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
		script.async = true;
		script.defer = true;

		const renderTurnstile = () => {
			if (containerRef.current && window.turnstile) {
				widgetIdRef.current = window.turnstile.render(containerRef.current, {
					sitekey: env.VITE_TURNSTILE_SITE_KEY || "",
					callback: onVerify,
					"error-callback": onError,
					"expired-callback": onExpire,
					theme,
					size,
					appearance,
				});

				// For invisible mode, execute immediately
				if (size === "invisible") {
					setTimeout(() => {
						if (widgetIdRef.current && window.turnstile) {
							window.turnstile.execute(widgetIdRef.current);
						}
					}, 100);
				}
			}
		};

		script.onload = renderTurnstile;
		document.head.appendChild(script);

		return () => {
			if (widgetIdRef.current && window.turnstile) {
				try {
					window.turnstile.remove(widgetIdRef.current);
				} catch (error) {
					// Suppress the warning if widget was already removed
					if (
						error instanceof Error &&
						!error.message.includes("Nothing to remove")
					) {
						console.error("Error removing Turnstile widget:", error);
					}
				}
			}
			document.head.removeChild(script);
		};
	}, [onVerify, onError, onExpire, theme, size, appearance]);

	if (!env.VITE_TURNSTILE_SITE_KEY) {
		return null;
	}

	return (
		<div
			ref={containerRef}
			className={size === "invisible" ? "hidden" : "flex justify-center my-4"}
		/>
	);
}
