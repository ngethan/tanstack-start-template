import { env } from "@/env";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TRPCError, initTRPC } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import superjson from "superjson";
import { ZodError } from "zod";

// Initialize Redis and rate limiter only if configured
const redis =
	env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
		? new Redis({
				url: env.UPSTASH_REDIS_REST_URL,
				token: env.UPSTASH_REDIS_REST_TOKEN,
			})
		: null;

// Pre-configured rate limiters for different use cases
const rateLimiters = redis
	? {
			// Default: 100 requests per minute
			default: new Ratelimit({
				redis,
				limiter: Ratelimit.slidingWindow(100, "1 m"),
				prefix: "ratelimit:default",
			}),
			// Strict: 10 requests per minute (for expensive operations)
			strict: new Ratelimit({
				redis,
				limiter: Ratelimit.slidingWindow(10, "1 m"),
				prefix: "ratelimit:strict",
			}),
			// Submission: 5 requests per hour (for content creation)
			submission: new Ratelimit({
				redis,
				limiter: Ratelimit.slidingWindow(5, "1 h"),
				prefix: "ratelimit:submission",
			}),
		}
	: null;

export type RateLimitType = "default" | "strict" | "submission";

export const createContext = async (opts?: { headers?: Headers }) => {
	let session = null;

	if (opts?.headers) {
		try {
			session = await auth.api.getSession({ headers: opts.headers });
		} catch (error) {
			console.error("Failed to get session:", error);
		}
	}

	return {
		session,
		db,
	};
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
	transformer: superjson,
	errorFormatter: ({ shape, error }) => ({
		...shape,
		data: {
			...shape.data,
			zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
		},
	}),
});

export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next }) => {
	if (t._config.isDev) {
		// artificial delay in dev 100-500ms
		const waitMs = Math.floor(Math.random() * 400) + 100;
		await new Promise((resolve) => setTimeout(resolve, waitMs));
	}

	const result = await next();

	return result;
});

/**
 * Rate limiting middleware factory
 * Applies rate limiting based on user ID (authenticated) or IP (anonymous)
 */
const createRateLimitMiddleware = (type: RateLimitType) =>
	t.middleware(async ({ ctx, next, path }) => {
		// Skip if rate limiting is not configured
		if (!rateLimiters) {
			return next();
		}

		const limiter = rateLimiters[type];

		// Use user ID if authenticated, otherwise use a generic key for public endpoints
		// In production, you'd want to extract IP from headers for anonymous users
		const identifier = ctx.session?.user?.id ?? "anonymous";
		const key = `${path}:${identifier}`;

		const { success, reset } = await limiter.limit(key);

		if (!success) {
			const resetIn = Math.ceil((reset - Date.now()) / 1000);
			throw new TRPCError({
				code: "TOO_MANY_REQUESTS",
				message: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
			});
		}

		return next();
	});

export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Subscription procedure - no artificial delay for real-time subscriptions
 */
export const subscriptionProcedure = t.procedure;

export const protectedProcedure = t.procedure
	.use(timingMiddleware)
	.use(({ ctx, next }) => {
		if (!ctx.session?.user) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		return next({
			ctx: {
				session: ctx.session,
				organizationId: ctx.session.session.activeOrganizationId ?? null,
			},
		});
	});

export const organizationProtectedProcedure = t.procedure
	.use(timingMiddleware)
	.use(({ ctx, next }) => {
		if (!ctx.session?.user) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		// Require an active organization for protected routes
		const organizationId = ctx.session.session.activeOrganizationId;
		if (!organizationId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "No active organization. Please contact support.",
			});
		}

		return next({
			ctx: {
				session: ctx.session,
				organizationId,
			},
		});
	});

/**
 * Rate-limited procedures for different use cases
 * Use these instead of protectedProcedure when you need rate limiting
 */
export const rateLimitedProcedure = {
	/** Default: 100 requests/minute - for general API endpoints */
	default: protectedProcedure.use(createRateLimitMiddleware("default")),
	/** Strict: 10 requests/minute - for expensive operations like AI calls */
	strict: protectedProcedure.use(createRateLimitMiddleware("strict")),
	/** Submission: 5 requests/hour - for content creation */
	submission: protectedProcedure.use(createRateLimitMiddleware("submission")),
};
