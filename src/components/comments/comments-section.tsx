import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/integrations/trpc/react";
import { authClient } from "@/lib/auth/client";
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Loader2, MessageSquare } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { CommentForm } from "./comment-form";
import { CommentItem, type CommentWithMeta } from "./comment-item";

export function CommentsSection({ postId }: { postId: string }) {
	const { data: session } = authClient.useSession();
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const [replyTo, setReplyTo] = useState<{
		id: string;
		userName: string;
	} | null>(null);
	const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
		new Set(),
	);
	const [likingCommentId, setLikingCommentId] = useState<string | null>(null);
	const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
		null,
	);
	const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

	// Fetch comments with pagination
	const {
		data: commentsData,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery(
		trpc.comments.list.infiniteQueryOptions(
			{ postId, limit: 20 },
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		),
	);

	// Flatten paginated comments
	const comments = useMemo(
		() => commentsData?.pages.flatMap((page) => page.comments) ?? [],
		[commentsData],
	);

	// Get total count for header display
	const { data: totalCount } = useQuery(
		trpc.comments.getCount.queryOptions({ postId }),
	);

	// Create comment mutation
	const createMutation = useMutation(
		trpc.comments.create.mutationOptions({
			onSuccess: async () => {
				await queryClient.refetchQueries({
					queryKey: trpc.comments.list.infiniteQueryKey({ postId, limit: 20 }),
				});
				await queryClient.refetchQueries({
					queryKey: trpc.comments.getCount.queryKey({ postId }),
				});
				toast.success("Comment posted!");
			},
			onError: (error) => {
				toast.error(error.message || "Failed to post comment");
			},
		}),
	);

	// Like mutation with optimistic updates
	const likeMutation = useMutation(
		trpc.comments.like.mutationOptions({
			onMutate: async ({ commentId }) => {
				setLikingCommentId(commentId);

				// Cancel any outgoing refetches
				await queryClient.cancelQueries({
					queryKey: trpc.comments.list.queryKey({ postId }),
				});

				// Snapshot previous values for rollback
				const previousComments = queryClient.getQueryData(
					trpc.comments.list.infiniteQueryKey({ postId, limit: 20 }),
				);

				// Helper to toggle like on a comment
				const toggleLike = (comment: CommentWithMeta): CommentWithMeta => {
					if (comment.id === commentId) {
						return {
							...comment,
							isLiked: !comment.isLiked,
							likeCount: comment.isLiked
								? comment.likeCount - 1
								: comment.likeCount + 1,
						};
					}
					return comment;
				};

				// Optimistically update comments list
				queryClient.setQueryData(
					trpc.comments.list.infiniteQueryKey({ postId, limit: 20 }),
					(old: typeof previousComments) => {
						if (!old) return old;
						return {
							...old,
							pages: old.pages.map((page) => ({
								...page,
								comments: page.comments.map(toggleLike),
							})),
						};
					},
				);

				// Also update any expanded replies
				for (const parentId of expandedReplies) {
					queryClient.setQueryData(
						trpc.comments.getReplies.queryKey({ commentId: parentId }),
						(old: CommentWithMeta[] | undefined) => {
							if (!old) return old;
							return old.map(toggleLike);
						},
					);
				}

				return { previousComments };
			},
			onError: (error, _variables, context) => {
				// Rollback on error
				if (context?.previousComments) {
					queryClient.setQueryData(
						trpc.comments.list.infiniteQueryKey({ postId, limit: 20 }),
						context.previousComments,
					);
				}
				toast.error(error.message || "Failed to like comment");
			},
			onSettled: () => {
				setLikingCommentId(null);
				// Always refetch after error or success to ensure consistency
				queryClient.invalidateQueries({
					queryKey: trpc.comments.list.queryKey({ postId }),
				});
			},
		}),
	);

	// Delete mutation
	const deleteMutation = useMutation(
		trpc.comments.delete.mutationOptions({
			onMutate: async ({ commentId }) => {
				setDeletingCommentId(commentId);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.comments.list.queryKey({ postId }),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.comments.getCount.queryKey({ postId }),
				});
				toast.success("Comment deleted");
			},
			onError: (error) => {
				toast.error(error.message || "Failed to delete comment");
			},
			onSettled: () => {
				setDeletingCommentId(null);
			},
		}),
	);

	// Edit mutation
	const editMutation = useMutation(
		trpc.comments.update.mutationOptions({
			onMutate: async ({ commentId }) => {
				setEditingCommentId(commentId);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.comments.list.queryKey({ postId }),
				});
				toast.success("Comment updated");
			},
			onError: (error) => {
				toast.error(error.message || "Failed to update comment");
			},
			onSettled: () => {
				setEditingCommentId(null);
			},
		}),
	);

	const handleSubmit = useCallback(
		async (data: {
			content: string;
			imageUrl?: string;
			gifUrl?: string;
			parentId?: string;
		}) => {
			await createMutation.mutateAsync({
				postId,
				content: data.content,
				...(data.imageUrl ? { imageUrl: data.imageUrl } : {}),
				...(data.gifUrl ? { gifUrl: data.gifUrl } : {}),
				...(data.parentId ? { parentId: data.parentId } : {}),
			});
		},
		[createMutation, postId],
	);

	const handleLike = useCallback(
		(commentId: string) => {
			likeMutation.mutate({ commentId });
		},
		[likeMutation],
	);

	const handleReply = useCallback((comment: CommentWithMeta) => {
		setReplyTo({
			id: comment.id,
			userName: comment.user.name,
		});
	}, []);

	const handleDelete = useCallback(
		(commentId: string) => {
			deleteMutation.mutate({ commentId });
		},
		[deleteMutation],
	);

	const handleEdit = useCallback(
		async (commentId: string, content: string) => {
			await editMutation.mutateAsync({ commentId, content });
		},
		[editMutation],
	);

	const handleViewReplies = useCallback((commentId: string) => {
		setExpandedReplies((prev) => {
			const next = new Set(prev);
			if (next.has(commentId)) {
				next.delete(commentId);
			} else {
				next.add(commentId);
			}
			return next;
		});
	}, []);

	const user = session?.user
		? {
				id: session.user.id,
				name: session.user.name,
				image: session.user.image ?? null,
			}
		: null;

	return (
		<Card id="comments-section" className="bg-card border-border">
			<CardHeader className="pb-4">
				<CardTitle className="flex items-center gap-2 text-base">
					<MessageSquare className="h-4 w-4" />
					Discussion
					{totalCount !== undefined && totalCount > 0 && (
						<span className="text-muted-foreground font-normal">
							({totalCount})
						</span>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Comment form - show sign in prompt if not authenticated */}
				{session ? (
					<CommentForm
						user={user}
						onSubmit={handleSubmit}
						isSubmitting={createMutation.isPending}
						replyTo={replyTo}
						onCancelReply={() => setReplyTo(null)}
					/>
				) : (
					<div className="text-center py-4 px-3 rounded-lg bg-muted/50">
						<p className="text-sm text-muted-foreground mb-2">
							Sign in to join the discussion
						</p>
						<div className="flex items-center justify-center gap-2">
							<Button asChild size="sm">
								<Link to="/signup">Sign up</Link>
							</Button>
							<Button asChild variant="outline" size="sm">
								<Link to="/login">Log in</Link>
							</Button>
						</div>
					</div>
				)}

				{/* Comments list */}
				{isLoading ? (
					<div className="space-y-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<CommentSkeleton
								key={`skeleton-${
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									i
								}`}
							/>
						))}
					</div>
				) : comments.length > 0 ? (
					<div className="space-y-4 pt-4 border-t border-border">
						{comments.map((comment) => (
							<div key={comment.id}>
								<CommentItem
									comment={comment}
									currentUserId={user?.id}
									onLike={handleLike}
									onReply={handleReply}
									onDelete={handleDelete}
									onEdit={handleEdit}
									onViewReplies={handleViewReplies}
									isLiking={likingCommentId === comment.id}
									isDeleting={deletingCommentId === comment.id}
									isEditing={editingCommentId === comment.id}
								/>

								{/* Replies */}
								{expandedReplies.has(comment.id) && (
									<RepliesList
										commentId={comment.id}
										currentUserId={user?.id}
										onLike={handleLike}
										onDelete={handleDelete}
										onEdit={handleEdit}
										likingCommentId={likingCommentId}
										deletingCommentId={deletingCommentId}
										editingCommentId={editingCommentId}
									/>
								)}
							</div>
						))}

						{/* Load more button */}
						{hasNextPage && (
							<div className="flex justify-center pt-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => fetchNextPage()}
									disabled={isFetchingNextPage}
								>
									{isFetchingNextPage ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Loading...
										</>
									) : (
										"Load more comments"
									)}
								</Button>
							</div>
						)}
					</div>
				) : (
					<div className="text-center py-8">
						<MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
						<p className="text-sm text-muted-foreground">
							No comments yet. Be the first to share your thoughts!
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

interface RepliesListProps {
	commentId: string;
	currentUserId?: string;
	onLike: (commentId: string) => void;
	onDelete: (commentId: string) => void;
	onEdit: (commentId: string, content: string) => Promise<void>;
	likingCommentId: string | null;
	deletingCommentId: string | null;
	editingCommentId: string | null;
}

function RepliesList({
	commentId,
	currentUserId,
	onLike,
	onDelete,
	onEdit,
	likingCommentId,
	deletingCommentId,
	editingCommentId,
}: RepliesListProps) {
	const trpc = useTRPC();

	const { data: replies, isLoading } = useQuery(
		trpc.comments.getReplies.queryOptions({ commentId }),
	);

	if (isLoading) {
		return (
			<div className="ml-10 mt-2 space-y-2">
				<CommentSkeleton />
			</div>
		);
	}

	if (!replies || replies.length === 0) {
		return null;
	}

	return (
		<div className="mt-2 space-y-3">
			{replies.map((reply) => (
				<CommentItem
					key={reply.id}
					comment={reply}
					currentUserId={currentUserId}
					onLike={onLike}
					onReply={() => {}} // Replies don't have nested replies
					onDelete={onDelete}
					onEdit={onEdit}
					isLiking={likingCommentId === reply.id}
					isDeleting={deletingCommentId === reply.id}
					isEditing={editingCommentId === reply.id}
					isReply
				/>
			))}
		</div>
	);
}

function CommentSkeleton() {
	return (
		<div className="flex gap-3">
			<Skeleton className="h-8 w-8 rounded-full" />
			<div className="flex-1 space-y-2">
				<Skeleton className="h-16 w-full rounded-xl" />
				<Skeleton className="h-4 w-24" />
			</div>
		</div>
	);
}
