import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/auth";
import { postComments, posts } from "@/lib/db/schema/posts";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
	rateLimitedProcedure,
} from "../init";

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 5000;

export const postsRouter = createTRPCRouter({
	/**
	 * List all posts with pagination
	 */
	list: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(50).default(20),
				cursor: z.string().optional(),
			}),
		)
		.query(async ({ input }) => {
			const postsResult = await db
				.select({
					post: posts,
					user: {
						id: users.id,
						name: users.name,
						image: users.image,
					},
				})
				.from(posts)
				.innerJoin(users, eq(posts.userId, users.id))
				.orderBy(desc(posts.createdAt))
				.limit(input.limit + 1);

			const postsList = postsResult.slice(0, input.limit);
			const postIds = postsList.map((p) => p.post.id);

			// Get comment counts for all posts
			const commentCounts =
				postIds.length > 0
					? await db
							.select({
								postId: postComments.postId,
								count: count(),
							})
							.from(postComments)
							.where(and(...postIds.map((id) => eq(postComments.postId, id))))
							.groupBy(postComments.postId)
					: [];

			const commentCountMap = new Map(
				commentCounts.map((c) => [c.postId, Number(c.count)]),
			);

			const postsWithMeta = postsList.map(({ post, user }) => ({
				...post,
				user,
				commentCount: commentCountMap.get(post.id) ?? 0,
			}));

			return {
				posts: postsWithMeta,
				nextCursor:
					postsResult.length > input.limit
						? postsList[postsList.length - 1]?.post.createdAt.toISOString()
						: undefined,
			};
		}),

	/**
	 * Get a single post by ID
	 */
	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const [result] = await db
				.select({
					post: posts,
					user: {
						id: users.id,
						name: users.name,
						image: users.image,
					},
				})
				.from(posts)
				.innerJoin(users, eq(posts.userId, users.id))
				.where(eq(posts.id, input.id));

			if (!result) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Post not found",
				});
			}

			// Get comment count
			const [commentCount] = await db
				.select({ count: count() })
				.from(postComments)
				.where(eq(postComments.postId, input.id));

			return {
				...result.post,
				user: result.user,
				commentCount: commentCount?.count ?? 0,
			};
		}),

	/**
	 * Create a new post
	 */
	create: rateLimitedProcedure.default
		.input(
			z.object({
				title: z.string().min(1).max(MAX_TITLE_LENGTH),
				content: z.string().min(1).max(MAX_CONTENT_LENGTH),
				imageUrl: z.string().url().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const postId = nanoid();

			await db.insert(posts).values({
				id: postId,
				title: input.title,
				content: input.content,
				imageUrl: input.imageUrl?.trim(),
				userId: ctx.session.user.id,
			});

			const [result] = await db
				.select({
					post: posts,
					user: {
						id: users.id,
						name: users.name,
						image: users.image,
					},
				})
				.from(posts)
				.innerJoin(users, eq(posts.userId, users.id))
				.where(eq(posts.id, postId));

			return {
				...result.post,
				user: result.user,
				commentCount: 0,
			};
		}),

	/**
	 * Update a post (only owner can update)
	 */
	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(1).max(MAX_TITLE_LENGTH).optional(),
				content: z.string().min(1).max(MAX_CONTENT_LENGTH).optional(),
				imageUrl: z.string().url().nullable().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [existing] = await db
				.select()
				.from(posts)
				.where(eq(posts.id, input.id));

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Post not found",
				});
			}

			if (existing.userId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only edit your own posts",
				});
			}

			const updates: Partial<typeof posts.$inferInsert> = {};
			if (input.title !== undefined) updates.title = input.title;
			if (input.content !== undefined) updates.content = input.content;
			if (input.imageUrl !== undefined) updates.imageUrl = input.imageUrl;

			await db.update(posts).set(updates).where(eq(posts.id, input.id));

			return { success: true };
		}),

	/**
	 * Delete a post (only owner can delete)
	 */
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [existing] = await db
				.select()
				.from(posts)
				.where(eq(posts.id, input.id));

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Post not found",
				});
			}

			if (existing.userId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only delete your own posts",
				});
			}

			// Delete the post (comments will cascade delete)
			await db.delete(posts).where(eq(posts.id, input.id));

			return { success: true };
		}),

	/**
	 * Get posts by a specific user
	 */
	getByUser: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				limit: z.number().min(1).max(50).default(20),
			}),
		)
		.query(async ({ input }) => {
			const postsResult = await db
				.select({
					post: posts,
					user: {
						id: users.id,
						name: users.name,
						image: users.image,
					},
				})
				.from(posts)
				.innerJoin(users, eq(posts.userId, users.id))
				.where(eq(posts.userId, input.userId))
				.orderBy(desc(posts.createdAt))
				.limit(input.limit);

			return postsResult.map(({ post, user }) => ({
				...post,
				user,
				commentCount: 0,
			}));
		}),
});
