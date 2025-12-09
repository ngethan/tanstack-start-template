import { Button } from "@/components/ui/button";
import { useTRPC } from "@/integrations/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute(
	"/dashboard/_dashboardLayout/posts/$postId",
)({
	component: PostDetailPage,
});

function PostDetailPage() {
	const { postId } = Route.useParams();
	const navigate = useNavigate();
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { data: post, isLoading } = useQuery(
		trpc.posts.getById.queryOptions({ id: postId }),
	);

	const { data: commentsData } = useQuery(
		trpc.comments.list.queryOptions({ postId, limit: 50 }),
	);

	const deletePost = useMutation(
		trpc.posts.delete.mutationOptions({
			onSuccess: () => {
				toast.success("Post deleted");
				queryClient.invalidateQueries({ queryKey: trpc.posts.list.queryKey() });
				navigate({ to: "/dashboard/posts" });
			},
			onError: (error) => {
				toast.error(error.message || "Failed to delete post");
			},
		}),
	);

	if (isLoading) {
		return (
			<div className="p-6 flex items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin" />
			</div>
		);
	}

	if (!post) {
		return (
			<div className="p-6 text-center">
				<p className="text-muted-foreground">Post not found</p>
				<Button
					variant="outline"
					onClick={() => navigate({ to: "/dashboard/posts" })}
					className="mt-4"
				>
					Back to Posts
				</Button>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-3xl">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate({ to: "/dashboard/posts" })}
				className="mb-4"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Back to Posts
			</Button>

			<article className="space-y-4">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold">{post.title}</h1>
						<div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
							<img
								src={post.user.image || "/default-avatar.png"}
								alt={post.user.name}
								className="w-6 h-6 rounded-full"
							/>
							<span>{post.user.name}</span>
							<span>•</span>
							<span>{new Date(post.createdAt).toLocaleDateString()}</span>
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="text-destructive hover:text-destructive"
						onClick={() => {
							if (confirm("Are you sure you want to delete this post?")) {
								deletePost.mutate({ id: postId });
							}
						}}
						disabled={deletePost.isPending}
					>
						{deletePost.isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Trash2 className="h-4 w-4" />
						)}
					</Button>
				</div>

				{post.imageUrl && (
					<img
						src={post.imageUrl}
						alt=""
						className="w-full rounded-lg max-h-96 object-cover"
					/>
				)}

				<div className="prose prose-sm dark:prose-invert max-w-none">
					<p className="whitespace-pre-wrap">{post.content}</p>
				</div>
			</article>

			{/* Comments Section */}
			<div className="mt-8 pt-8 border-t">
				<h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
					<MessageSquare className="h-5 w-5" />
					Comments ({post.commentCount})
				</h2>

				{commentsData?.comments && commentsData.comments.length > 0 ? (
					<div className="space-y-4">
						{commentsData.comments.map((comment) => (
							<div key={comment.id} className="rounded-lg border bg-card p-4">
								<div className="flex items-center gap-2 mb-2">
									<img
										src={comment.user.image || "/default-avatar.png"}
										alt={comment.user.name}
										className="w-6 h-6 rounded-full"
									/>
									<span className="font-medium text-sm">
										{comment.user.name}
									</span>
									<span className="text-xs text-muted-foreground">
										{new Date(comment.createdAt).toLocaleDateString()}
									</span>
								</div>
								<p className="text-sm">{comment.content}</p>
							</div>
						))}
					</div>
				) : (
					<p className="text-muted-foreground text-sm">
						No comments yet. Be the first to comment!
					</p>
				)}
			</div>
		</div>
	);
}
