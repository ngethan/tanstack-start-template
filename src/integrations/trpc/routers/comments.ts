import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/auth";
import { commentLikes, postComments, posts } from "@/lib/db/schema/posts";
import {
	ALLOWED_MIME_TYPES,
	MAX_FILE_SIZE,
	uploadCommentImage,
} from "@/lib/storage";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, inArray, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
	rateLimitedProcedure,
} from "../init";

const MAX_COMMENT_LENGTH = 500;

export const commentsRouter = createTRPCRouter({
	/**
	 * Get comments for a post
	 */
	list: publicProcedure
		.input(
			z.object({
				postId: z.string(),
				limit: z.number().min(1).max(100).default(50),
				cursor: z.string().optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const userId = ctx.session?.user?.id;

			// Get top-level comments
			const commentsResult = await db
				.select({
					comment: postComments,
					user: {
						id: users.id,
						name: users.name,
						image: users.image,
					},
				})
				.from(postComments)
				.innerJoin(users, eq(postComments.userId, users.id))
				.where(
					and(
						eq(postComments.postId, input.postId),
						isNull(postComments.parentId),
					),
				)
				.orderBy(desc(postComments.createdAt))
				.limit(input.limit + 1);

			const comments = commentsResult.slice(0, input.limit);
			const commentIds = comments.map((c) => c.comment.id);

			// Get like counts for all comments
			const likeCounts =
				commentIds.length > 0
					? await db
							.select({
								commentId: commentLikes.commentId,
								count: count(),
							})
							.from(commentLikes)
							.where(inArray(commentLikes.commentId, commentIds))
							.groupBy(commentLikes.commentId)
					: [];

			// Get user's likes if authenticated (only for the fetched comments)
			let userLikes: string[] = [];
			if (userId && commentIds.length > 0) {
				const likes = await db
					.select({ commentId: commentLikes.commentId })
					.from(commentLikes)
					.where(
						and(
							eq(commentLikes.userId, userId),
							inArray(commentLikes.commentId, commentIds),
						),
					);
				userLikes = likes.map((l) => l.commentId);
			}

			// Get reply counts
			const replyCounts = await db
				.select({
					parentId: postComments.parentId,
					count: count(),
				})
				.from(postComments)
				.where(eq(postComments.postId, input.postId))
				.groupBy(postComments.parentId);

			const likeCountMap = new Map(
				likeCounts.map((l) => [l.commentId, Number(l.count)]),
			);
			const replyCountMap = new Map(
				replyCounts
					.filter((r) => r.parentId !== null)
					.map((r) => [r.parentId as string, Number(r.count)]),
			);

			const commentsWithMeta = comments.map(({ comment, user }) => ({
				...comment,
				user,
				likeCount: likeCountMap.get(comment.id) ?? 0,
				replyCount: replyCountMap.get(comment.id) ?? 0,
				isLiked: userLikes.includes(comment.id),
				isDeleted: comment.deletedAt !== null,
			}));

			return {
				comments: commentsWithMeta,
				nextCursor:
					commentsResult.length > input.limit
						? comments[comments.length - 1]?.comment.createdAt.toISOString()
						: undefined,
			};
		}),

	/**
	 * Get replies to a comment
	 */
	getReplies: publicProcedure
		.input(
			z.object({
				commentId: z.string(),
				limit: z.number().min(1).max(50).default(20),
			}),
		)
		.query(async ({ input, ctx }) => {
			const userId = ctx.session?.user?.id;

			const replies = await db
				.select({
					comment: postComments,
					user: {
						id: users.id,
						name: users.name,
						image: users.image,
					},
				})
				.from(postComments)
				.innerJoin(users, eq(postComments.userId, users.id))
				.where(eq(postComments.parentId, input.commentId))
				.orderBy(postComments.createdAt)
				.limit(input.limit);

			const replyIds = replies.map((r) => r.comment.id);

			// Get like counts for replies only
			const likeCounts =
				replyIds.length > 0
					? await db
							.select({
								commentId: commentLikes.commentId,
								count: count(),
							})
							.from(commentLikes)
							.where(inArray(commentLikes.commentId, replyIds))
							.groupBy(commentLikes.commentId)
					: [];

			// Get user's likes if authenticated (only for the fetched replies)
			let userLikes: string[] = [];
			if (userId && replyIds.length > 0) {
				const likes = await db
					.select({ commentId: commentLikes.commentId })
					.from(commentLikes)
					.where(
						and(
							eq(commentLikes.userId, userId),
							inArray(commentLikes.commentId, replyIds),
						),
					);
				userLikes = likes.map((l) => l.commentId);
			}

			const likeCountMap = new Map(
				likeCounts.map((l) => [l.commentId, Number(l.count)]),
			);

			return replies.map(({ comment, user }) => ({
				...comment,
				user,
				likeCount: likeCountMap.get(comment.id) ?? 0,
				replyCount: 0, // Replies don't have nested replies
				isLiked: userLikes.includes(comment.id),
				isDeleted: comment.deletedAt !== null,
			}));
		}),

	/**
	 * Create a new comment
	 */
	create: rateLimitedProcedure.default
		.input(
			z
				.object({
					postId: z.string(),
					content: z.string().max(MAX_COMMENT_LENGTH),
					imageUrl: z.string().url().optional(),
					gifUrl: z.string().url().optional(),
					parentId: z.string().optional(),
				})
				.refine(
					(data) =>
						data.content.trim().length > 0 || data.imageUrl || data.gifUrl,
					{
						message: "Comment must have text or media",
						path: ["content"],
					},
				),
		)
		.mutation(async ({ ctx, input }) => {
			// Verify post exists
			const [post] = await db
				.select({ id: posts.id })
				.from(posts)
				.where(eq(posts.id, input.postId));

			if (!post) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Post not found",
				});
			}

			// If replying, verify parent comment exists
			if (input.parentId) {
				const [parent] = await db
					.select({ id: postComments.id })
					.from(postComments)
					.where(eq(postComments.id, input.parentId));

				if (!parent) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Parent comment not found",
					});
				}
			}

			const commentId = nanoid();

			try {
				await db.insert(postComments).values({
					id: commentId,
					postId: input.postId,
					userId: ctx.session.user.id,
					content: input.content,
					imageUrl: input.imageUrl?.trim(),
					gifUrl: input.gifUrl?.trim(),
					parentId: input.parentId?.trim(),
				});
			} catch (error) {
				console.error("Failed to insert comment:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error ? error.message : "Failed to create comment",
				});
			}

			// Fetch and return the created comment with user info
			const [result] = await db
				.select({
					comment: postComments,
					user: {
						id: users.id,
						name: users.name,
						image: users.image,
					},
				})
				.from(postComments)
				.innerJoin(users, eq(postComments.userId, users.id))
				.where(eq(postComments.id, commentId));

			return {
				...result.comment,
				user: result.user,
				likeCount: 0,
				replyCount: 0,
				isLiked: false,
				isDeleted: false,
			};
		}),

	/**
	 * Update a comment (only owner can update)
	 */
	update: protectedProcedure
		.input(
			z.object({
				commentId: z.string(),
				content: z.string().min(1).max(MAX_COMMENT_LENGTH),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [existing] = await db
				.select()
				.from(postComments)
				.where(eq(postComments.id, input.commentId));

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Comment not found",
				});
			}

			if (existing.deletedAt !== null) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot edit a deleted comment",
				});
			}

			if (existing.userId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only edit your own comments",
				});
			}

			await db
				.update(postComments)
				.set({ content: input.content })
				.where(eq(postComments.id, input.commentId));

			return { success: true };
		}),

	/**
	 * Delete a comment (soft-delete - preserves structure for replies)
	 */
	delete: protectedProcedure
		.input(z.object({ commentId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [existing] = await db
				.select()
				.from(postComments)
				.where(eq(postComments.id, input.commentId));

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Comment not found",
				});
			}

			if (existing.deletedAt !== null) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Comment is already deleted",
				});
			}

			if (existing.userId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only delete your own comments",
				});
			}

			// Soft delete: clear content and media, set deletedAt timestamp
			await db
				.update(postComments)
				.set({
					deletedAt: new Date(),
					content: "[deleted]",
					imageUrl: null,
					gifUrl: null,
				})
				.where(eq(postComments.id, input.commentId));

			// Also delete any likes on this comment
			await db
				.delete(commentLikes)
				.where(eq(commentLikes.commentId, input.commentId));

			return { success: true };
		}),

	/**
	 * Like a comment
	 */
	like: protectedProcedure
		.input(z.object({ commentId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [existing] = await db
				.select()
				.from(postComments)
				.where(eq(postComments.id, input.commentId));

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Comment not found",
				});
			}

			if (existing.deletedAt !== null) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot like a deleted comment",
				});
			}

			// Check if already liked
			const [existingLike] = await db
				.select()
				.from(commentLikes)
				.where(
					and(
						eq(commentLikes.commentId, input.commentId),
						eq(commentLikes.userId, ctx.session.user.id),
					),
				);

			if (existingLike) {
				// Unlike
				await db
					.delete(commentLikes)
					.where(eq(commentLikes.id, existingLike.id));
				return { liked: false };
			}

			// Like
			await db.insert(commentLikes).values({
				id: nanoid(),
				commentId: input.commentId,
				userId: ctx.session.user.id,
			});

			return { liked: true };
		}),

	/**
	 * Get comment count for a post
	 */
	getCount: publicProcedure
		.input(z.object({ postId: z.string() }))
		.query(async ({ input }) => {
			const [result] = await db
				.select({ count: count() })
				.from(postComments)
				.where(eq(postComments.postId, input.postId));

			return result?.count ?? 0;
		}),

	/**
	 * Upload an image for a comment
	 * Returns the public URL of the uploaded image
	 */
	uploadImage: rateLimitedProcedure.default
		.input(
			z.object({
				// Base64 encoded image data
				imageData: z.string(),
				// Original file name
				fileName: z.string(),
				// MIME type
				contentType: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Validate MIME type
			if (!ALLOWED_MIME_TYPES.includes(input.contentType)) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
				});
			}

			// Decode base64 to buffer
			const base64Data = input.imageData.replace(
				/^data:image\/\w+;base64,/,
				"",
			);
			const buffer = Buffer.from(base64Data, "base64");

			// Validate file size
			if (buffer.length > MAX_FILE_SIZE) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
				});
			}

			// Generate unique file name
			const extension = input.fileName.split(".").pop() || "jpg";
			const uniqueFileName = `${ctx.session.user.id}/${nanoid()}.${extension}`;

			try {
				const publicUrl = await uploadCommentImage(
					buffer,
					uniqueFileName,
					input.contentType,
				);

				return { url: publicUrl };
			} catch (error) {
				console.error("Failed to upload image:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error ? error.message : "Failed to upload image",
				});
			}
		}),
});
