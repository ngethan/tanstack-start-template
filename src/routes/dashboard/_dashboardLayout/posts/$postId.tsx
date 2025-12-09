import { CommentsSection } from "@/components/comments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTRPC } from "@/integrations/trpc/react";
import { authClient } from "@/lib/auth/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Loader2, Trash2 } from "lucide-react";
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
	const { data: session } = authClient.useSession();

	const { data: post, isLoading } = useQuery(
		trpc.posts.getById.queryOptions({ id: postId }),
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
			<div className="p-6 flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!post) {
		return (
			<div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
				<p className="text-muted-foreground mb-4">Post not found</p>
				<Button
					variant="outline"
					onClick={() => navigate({ to: "/dashboard/posts" })}
				>
					Back to Posts
				</Button>
			</div>
		);
	}

	const initials = post.user.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<div className="p-6 max-w-3xl mx-auto space-y-6">
			{/* Back button */}
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate({ to: "/dashboard/posts" })}
				className="-ml-2"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Back to Posts
			</Button>

			{/* Post Card */}
			<Card>
				<CardContent className="p-6 space-y-6">
					{/* Header */}
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-start gap-3">
							<Avatar className="h-10 w-10">
								<AvatarImage
									src={post.user.image ?? undefined}
									alt={post.user.name}
								/>
								<AvatarFallback>{initials}</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-medium">{post.user.name}</p>
								<div className="flex items-center gap-1 text-xs text-muted-foreground">
									<Calendar className="h-3 w-3" />
									<span>
										{new Date(post.createdAt).toLocaleDateString(undefined, {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</span>
								</div>
							</div>
						</div>
						{session?.user?.id === post.userId && (
							<Button
								variant="ghost"
								size="icon"
								className="text-muted-foreground hover:text-destructive"
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
						)}
					</div>

					{/* Title */}
					<h1 className="text-2xl font-bold">{post.title}</h1>

					{/* Image */}
					{post.imageUrl && (
						<img
							src={post.imageUrl}
							alt=""
							className="w-full rounded-xl max-h-[500px] object-cover"
						/>
					)}

					{/* Content */}
					<div className="prose prose-sm dark:prose-invert max-w-none">
						<p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
							{post.content}
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Comments Section */}
			<CommentsSection postId={postId} />
		</div>
	);
}
