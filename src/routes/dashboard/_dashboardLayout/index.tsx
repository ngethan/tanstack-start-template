import { Button } from "@/components/ui/button";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { FileText, MessageSquare, PlusCircle, Settings } from "lucide-react";

export const Route = createFileRoute("/dashboard/_dashboardLayout/")({
	component: DashboardHome,
});

function DashboardHome() {
	const trpc = useTRPC();
	const { data: user } = useQuery(trpc.user.me.queryOptions());
	const { data: postsData } = useQuery(
		trpc.posts.list.queryOptions({ limit: 5 }),
	);

	return (
		<div className="p-6 space-y-8">
			{/* Welcome Section */}
			<div>
				<h1 className="text-2xl font-bold">
					Welcome back{user?.name ? `, ${user.name}` : ""}
				</h1>
				<p className="text-muted-foreground mt-1">
					Here's what's happening in your dashboard.
				</p>
			</div>

			{/* Quick Actions */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<QuickActionCard
					icon={<PlusCircle className="h-5 w-5" />}
					title="Create Post"
					description="Share something with the community"
					href="/dashboard/posts/new"
				/>
				<QuickActionCard
					icon={<FileText className="h-5 w-5" />}
					title="View Posts"
					description="Browse all posts"
					href="/dashboard/posts"
				/>
				<QuickActionCard
					icon={<MessageSquare className="h-5 w-5" />}
					title="Recent Activity"
					description="See what's new"
					href="/dashboard/posts"
				/>
				<QuickActionCard
					icon={<Settings className="h-5 w-5" />}
					title="Settings"
					description="Manage your account"
					href="/settings"
				/>
			</div>

			{/* Recent Posts */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold">Recent Posts</h2>
					<Button asChild variant="ghost" size="sm">
						<Link to="/dashboard/posts">View all</Link>
					</Button>
				</div>
				<div className="rounded-lg border bg-card">
					{postsData?.posts && postsData.posts.length > 0 ? (
						<div className="divide-y">
							{postsData.posts.map((post) => (
								<div key={post.id} className="p-4">
									<h3 className="font-medium">{post.title}</h3>
									<p className="text-sm text-muted-foreground line-clamp-2 mt-1">
										{post.content}
									</p>
									<div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
										<span>{post.user.name}</span>
										<span>•</span>
										<span>{post.commentCount} comments</span>
									</div>
								</div>
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
		</div>
	);
}

function QuickActionCard({
	icon,
	title,
	description,
	href,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
	href: string;
}) {
	return (
		<Link
			to={href}
			className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors"
		>
			<div className="text-primary mb-2">{icon}</div>
			<h3 className="font-medium">{title}</h3>
			<p className="text-sm text-muted-foreground">{description}</p>
		</Link>
	);
}
