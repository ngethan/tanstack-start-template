import { Button } from "@/components/ui/button";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { FileText, MessageSquare, PlusCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard/_dashboardLayout/posts/")({
	component: PostsPage,
});

function PostsPage() {
	const trpc = useTRPC();
	const { data, isLoading } = useQuery(
		trpc.posts.list.queryOptions({ limit: 50 }),
	);

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Posts</h1>
					<p className="text-muted-foreground">Browse and create posts</p>
				</div>
				<Button asChild>
					<Link to="/dashboard/posts/new">
						<PlusCircle className="h-4 w-4 mr-2" />
						New Post
					</Link>
				</Button>
			</div>

			<div className="rounded-lg border bg-card">
				{isLoading ? (
					<div className="p-8 text-center text-muted-foreground">
						Loading posts...
					</div>
				) : data?.posts && data.posts.length > 0 ? (
					<div className="divide-y">
						{data.posts.map((post) => (
							<Link
								key={post.id}
								to="/dashboard/posts/$postId"
								params={{ postId: post.id }}
								className="block p-4 hover:bg-accent transition-colors"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="min-w-0 flex-1">
										<h3 className="font-medium truncate">{post.title}</h3>
										<p className="text-sm text-muted-foreground line-clamp-2 mt-1">
											{post.content}
										</p>
										<div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
											<span>By {post.user.name}</span>
											<span className="flex items-center gap-1">
												<MessageSquare className="h-3 w-3" />
												{post.commentCount} comments
											</span>
										</div>
									</div>
									{post.imageUrl && (
										<img
											src={post.imageUrl}
											alt=""
											className="w-20 h-20 rounded object-cover shrink-0"
										/>
									)}
								</div>
							</Link>
						))}
					</div>
				) : (
					<div className="p-8 text-center text-muted-foreground">
						<FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
						<p>No posts yet. Be the first to create one!</p>
						<Button asChild variant="outline" size="sm" className="mt-4">
							<Link to="/dashboard/posts/new">Create Post</Link>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
