import { env } from "@/env";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getBaseURL() {
	// Local development
	if (env.VITE_APP_ENV === "development") {
		return "http://localhost:3000";
	}

	// Custom SERVER_URL takes precedence
	if (env.SERVER_URL) {
		return env.SERVER_URL;
	}

	// Vercel production
	if (env.VERCEL_ENV === "production" && env.VERCEL_PROJECT_PRODUCTION_URL) {
		return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
	}

	// Vercel preview/development deployments
	if (env.VERCEL_URL) {
		return `https://${env.VERCEL_URL}`;
	}

	// Fallback
	return "http://localhost:3000";
}
