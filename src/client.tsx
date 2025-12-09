import * as Sentry from "@sentry/tanstackstart-react";
import { ErrorBoundary } from "@sentry/tanstackstart-react";
import { StartClient } from "@tanstack/react-start";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { env } from "./env";
import { createRouter } from "./router";

const router = createRouter();

Sentry.init({
	dsn: "https://947996258e10b1f61712034b10e0a7d4@o4510042389872640.ingest.us.sentry.io/4510042494664704",
	// Adds request headers and IP for users, for more info visit:
	// https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#sendDefaultPii
	sendDefaultPii: true,
	integrations: [
		//  performance
		Sentry.tanstackRouterBrowserTracingIntegration(router),
		//  performance
		//  session-replay
		Sentry.replayIntegration(),
		//  session-replay
		//  user-feedback
		Sentry.feedbackIntegration({
			autoInject: false,
		}),
		//  user-feedback
	],
	//  logs
	// Enable logs to be sent to Sentry
	enableLogs: true,
	//  logs
	//  performance
	// Set tracesSampleRate to 1.0 to capture 100%
	// of transactions for tracing.
	// We recommend adjusting this value in production.
	// Learn more at https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
	tracesSampleRate: 1.0,
	//  performance
	//  session-replay
	// Capture Replay for 10% of all sessions,
	// plus for 100% of sessions with an error.
	// Learn more at https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1.0,
	//  session-replay
});

posthog.init(env.VITE_PUBLIC_POSTHOG_KEY, {
	api_host: env.VITE_PUBLIC_POSTHOG_HOST,
	ui_host: "https://us.posthog.com",
	capture_pageview: true,
	capture_pageleave: true,
	capture_performance: true,
	autocapture: true,
	disable_session_recording: env.VITE_APP_ENV === "development",
	debug: env.VITE_APP_ENV === "development",
	loaded: (posthog) => {
		if (env.VITE_APP_ENV === "development") {
			posthog.opt_out_capturing();
		}
	},
});

hydrateRoot(
	document,
	<StrictMode>
		<ErrorBoundary>
			<PostHogProvider client={posthog}>
				<StartClient router={router} />
			</PostHogProvider>
		</ErrorBoundary>
	</StrictMode>,
);
