import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/integrations/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/_dashboardLayout/posts/new")({
	component: NewPostPage,
});

function NewPostPage() {
	const navigate = useNavigate();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");

	const createPost = useMutation(
		trpc.posts.create.mutationOptions({
			onSuccess: (data) => {
				toast.success("Post created successfully!");
				queryClient.invalidateQueries({ queryKey: trpc.posts.list.queryKey() });
				navigate({
					to: "/dashboard/posts/$postId",
					params: { postId: data.id },
				});
			},
			onError: (error) => {
				toast.error(error.message || "Failed to create post");
			},
		}),
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !content.trim()) {
			toast.error("Please fill in all fields");
			return;
		}
		createPost.mutate({ title: title.trim(), content: content.trim() });
	};

	return (
		<div className="p-6 max-w-2xl">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate({ to: "/dashboard/posts" })}
				className="mb-4"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Back to Posts
			</Button>

			<h1 className="text-2xl font-bold mb-6">Create New Post</h1>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="title">Title</Label>
					<Input
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Enter post title..."
						maxLength={200}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="content">Content</Label>
					<Textarea
						id="content"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder="Write your post content..."
						rows={8}
						maxLength={5000}
					/>
					<p className="text-xs text-muted-foreground text-right">
						{content.length}/5000
					</p>
				</div>

				<div className="flex gap-3">
					<Button
						type="submit"
						disabled={createPost.isPending || !title.trim() || !content.trim()}
					>
						{createPost.isPending && (
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						)}
						Create Post
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => navigate({ to: "/dashboard/posts" })}
					>
						Cancel
					</Button>
				</div>
			</form>
		</div>
	);
}
