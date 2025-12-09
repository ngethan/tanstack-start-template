import { createEnv } from "@t3-oss/env-core";
import { vercel } from "@t3-oss/env-core/presets-zod";
import { z } from "zod";

export const env = createEnv({
	extends: [vercel()],
	server: {
		SERVER_URL: z.string().url().optional(),
		DATABASE_URL: z.string().url(),
		BETTER_AUTH_SECRET: z.string(),
		GOOGLE_CLIENT_SECRET: z.string(),
		RESEND_API_KEY: z.string(),
		SENTRY_AUTH_TOKEN: z.string().optional(),
		TURNSTILE_SECRET_KEY: z.string(),
		UPSTASH_REDIS_REST_URL: z.string().url().optional(),
		UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
		SUPABASE_URL: z.string().url(),
		SUPABASE_SERVICE_ROLE_KEY: z.string(),
	},

	/**
	 * The prefix that client-side variables must have. This is enforced both at
	 * a type-level and at runtime.
	 */
	clientPrefix: "VITE_",

	client: {
		VITE_APP_ENV: z.enum(["development", "staging", "production"]),
		VITE_GOOGLE_CLIENT_ID: z.string(),
		VITE_SENTRY_ORG: z.string().optional(),
		VITE_SENTRY_PROJECT: z.string().optional(),
		VITE_TURNSTILE_SITE_KEY: z.string().optional(),
		VITE_PUBLIC_POSTHOG_KEY: z.string(),
		VITE_PUBLIC_POSTHOG_HOST: z.string(),
		VITE_GIPHY_API_KEY: z.string().optional(),
	},

	/**
	 * What object holds the environment variables at runtime. This is usually
	 * `process.env` or `import.meta.env`.
	 */
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
		RESEND_API_KEY: process.env.RESEND_API_KEY,
		SERVER_URL: process.env.SERVER_URL,
		SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
		TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
		UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
		UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
		SUPABASE_URL: process.env.SUPABASE_URL,
		SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

		VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
		VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
		VITE_SENTRY_ORG: import.meta.env.VITE_SENTRY_ORG,
		VITE_SENTRY_PROJECT: import.meta.env.VITE_SENTRY_PROJECT,
		VITE_TURNSTILE_SITE_KEY: import.meta.env.VITE_TURNSTILE_SITE_KEY,
		VITE_PUBLIC_POSTHOG_KEY: import.meta.env.VITE_PUBLIC_POSTHOG_KEY,
		VITE_PUBLIC_POSTHOG_HOST: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
		VITE_GIPHY_API_KEY: import.meta.env.VITE_GIPHY_API_KEY,
	},

	/**
	 * By default, this library will feed the environment variables directly to
	 * the Zod validator.
	 *
	 * This means that if you have an empty string for a value that is supposed
	 * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
	 * it as a type mismatch violation. Additionally, if you have an empty string
	 * for a value that is supposed to be a string with a default value (e.g.
	 * `DOMAIN=` in an ".env" file), the default value will never be applied.
	 *
	 * In order to solve these issues, we recommend that all new projects
	 * explicitly specify this option as true.
	 */
	emptyStringAsUndefined: true,
});
