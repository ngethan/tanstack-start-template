import { NotFound } from "@/components/not-found";
import { ThemeProvider } from "@/components/theme-provider";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Toaster } from "@/components/ui/sonner";
import { appConfig } from "@/config/app";
import { ShortcutProvider } from "@/lib/shortcuts/shortcut-context";
import { TanstackDevtools } from "@tanstack/react-devtools";
import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
	useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Analytics } from "@vercel/analytics/react";

import { wrapCreateRootRouteWithSentry } from "@sentry/tanstackstart-react";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import { env } from "@/env";
import type { TRPCRouter } from "@/integrations/trpc/root";
import type { QueryClient } from "@tanstack/react-query";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";

interface MyRouterContext {
	queryClient: QueryClient;

	trpc: TRPCOptionsProxy<TRPCRouter>;
}

export const Route = wrapCreateRootRouteWithSentry(
	createRootRouteWithContext<MyRouterContext>()({
		head: () => ({
			meta: [
				{
					charSet: "utf-8",
				},
				{
					name: "viewport",
					content: "width=device-width, initial-scale=1",
				},
				{
					title: appConfig.name,
				},
			],
			links: [
				{
					rel: "stylesheet",
					href: appCss,
				},
			],
		}),

		shellComponent: RootDocument,
		notFoundComponent: NotFound,
	}),
);

function RootDocument({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const isNavigating = router.state.isLoading;
	const isDashboard = router.state.location.pathname.startsWith("/dashboard");

	return (
		<html lang="en">
			<head>
				<HeadContent />
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								const theme = localStorage.getItem('${appConfig.themeStorageKey}') || 'system';
								const root = document.documentElement;

								if (theme === 'system') {
									const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
										? 'dark'
										: 'light';
									root.classList.add(systemTheme);
								} else {
									root.classList.add(theme);
								}
							})()
						`,
					}}
				/>
			</head>
			<body
				className={`${isDashboard ? "bg-muted" : "bg-background"} text-foreground`}
			>
				<ThemeProvider defaultTheme="system">
					<ShortcutProvider>
						<ProgressBar isLoading={isNavigating} />
						{children}
						<Toaster richColors closeButton position="top-right" />
					</ShortcutProvider>
				</ThemeProvider>
				{env.VITE_APP_ENV === "development" && (
					<TanstackDevtools
						config={{
							position: "bottom-left",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
							TanStackQueryDevtools,
						]}
					/>
				)}
				<Analytics />
				<Scripts />
			</body>
		</html>
	);
}
