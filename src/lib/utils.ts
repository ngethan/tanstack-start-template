import { env } from "@/env";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getBaseURL() {
	return env.VITE_APP_ENV === "development"
		? "http://localhost:3000"
		: env.VITE_APP_ENV === "staging"
			? "https://staging.example.com"
			: "https://example.com";
}
