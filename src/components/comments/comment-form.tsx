import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/integrations/trpc/react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { GiphyPicker } from "./giphy-picker";

const MAX_CHARS = 500;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

interface CommentFormProps {
	user: {
		id: string;
		name: string;
		image: string | null;
	} | null;
	onSubmit: (data: {
		content: string;
		imageUrl?: string;
		gifUrl?: string;
		parentId?: string;
	}) => Promise<void>;
	isSubmitting?: boolean;
	replyTo?: {
		id: string;
		userName: string;
	} | null;
	onCancelReply?: () => void;
	placeholder?: string;
}

export function CommentForm({
	user,
	onSubmit,
	isSubmitting = false,
	replyTo,
	onCancelReply,
	placeholder = "Add a comment...",
}: CommentFormProps) {
	const trpc = useTRPC();
	const [content, setContent] = useState("");
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [gifUrl, setGifUrl] = useState<string | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const uploadMutation = useMutation(
		trpc.comments.uploadImage.mutationOptions({
			onError: (error) => {
				toast.error(error.message || "Failed to upload image");
				clearMedia();
			},
		}),
	);

	const charsRemaining = MAX_CHARS - content.length;
	const isOverLimit = charsRemaining < 0;
	const isBusy = isSubmitting || isUploading || uploadMutation.isPending;
	const hasMedia = imageUrl !== null || gifUrl !== null;
	const canSubmit =
		(content.trim().length > 0 || hasMedia) && !isOverLimit && !isBusy;

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!canSubmit) return;

			await onSubmit({
				content: content.trim(),
				imageUrl: imageUrl ?? undefined,
				gifUrl: gifUrl ?? undefined,
				parentId: replyTo?.id,
			});

			// Reset form
			setContent("");
			setImageUrl(null);
			setGifUrl(null);
			setImagePreview(null);
			onCancelReply?.();
		},
		[content, imageUrl, gifUrl, replyTo, canSubmit, onSubmit, onCancelReply],
	);

	const handleImageSelect = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			// Validate file type
			if (!ALLOWED_TYPES.includes(file.type)) {
				toast.error(
					"Invalid file type. Please upload JPEG, PNG, GIF, or WebP.",
				);
				return;
			}

			// Validate file size
			if (file.size > MAX_FILE_SIZE) {
				toast.error("File too large. Maximum size is 5MB.");
				return;
			}

			setIsUploading(true);

			// Create preview
			const reader = new FileReader();
			reader.onload = async (event) => {
				const dataUrl = event.target?.result as string;
				setImagePreview(dataUrl);
				setGifUrl(null);

				try {
					// Upload to Supabase
					const result = await uploadMutation.mutateAsync({
						imageData: dataUrl,
						fileName: file.name,
						contentType: file.type,
					});

					setImageUrl(result.url);
				} catch {
					// Error handled by mutation onError
				} finally {
					setIsUploading(false);
				}
			};
			reader.readAsDataURL(file);
		},
		[uploadMutation],
	);

	const handleGifSelect = useCallback((url: string) => {
		setGifUrl(url);
		setImageUrl(null);
		setImagePreview(null);
	}, []);

	const clearMedia = useCallback(() => {
		setImageUrl(null);
		setGifUrl(null);
		setImagePreview(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, []);

	if (!user) {
		return null;
	}

	const initials = user.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<form onSubmit={handleSubmit} className="flex gap-3">
			<Avatar className="h-8 w-8 flex-shrink-0">
				<AvatarImage src={user.image ?? undefined} alt={user.name} />
				<AvatarFallback className="text-xs">{initials}</AvatarFallback>
			</Avatar>

			<div className="flex-1 space-y-2">
				{/* Reply indicator */}
				{replyTo && (
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<span>Replying to {replyTo.userName}</span>
						<button
							type="button"
							onClick={onCancelReply}
							className="hover:text-foreground"
						>
							<X className="h-3 w-3" />
						</button>
					</div>
				)}

				{/* Text input */}
				<div className="relative">
					<Textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder={placeholder}
						rows={2}
						className="resize-none pr-12 min-h-[60px]"
						disabled={isBusy}
					/>
					<div
						className={cn(
							"absolute bottom-2 right-2 text-xs",
							isOverLimit ? "text-destructive" : "text-muted-foreground",
						)}
					>
						{charsRemaining}
					</div>
				</div>

				{/* Media preview */}
				{(imagePreview || gifUrl) && (
					<div className="relative inline-block">
						<img
							src={imagePreview || gifUrl || ""}
							alt="Preview"
							className="max-h-32 rounded-lg"
						/>
						{isUploading && (
							<div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
								<Loader2 className="h-6 w-6 animate-spin" />
							</div>
						)}
						<button
							type="button"
							onClick={clearMedia}
							disabled={isBusy}
							className="absolute -top-2 -right-2 p-1 rounded-full bg-background border border-border shadow-sm hover:bg-muted disabled:opacity-50"
						>
							<X className="h-3 w-3" />
						</button>
					</div>
				)}

				{/* Actions */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-1">
						{/* Image upload */}
						<input
							ref={fileInputRef}
							type="file"
							accept="image/jpeg,image/png,image/gif,image/webp"
							onChange={handleImageSelect}
							className="hidden"
							id="comment-image-upload"
						/>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-8 px-2 text-muted-foreground hover:text-foreground"
							onClick={() => fileInputRef.current?.click()}
							disabled={isBusy}
						>
							<ImagePlus className="h-4 w-4" />
						</Button>

						{/* GIF picker */}
						<GiphyPicker onSelect={handleGifSelect} disabled={isBusy} />
					</div>

					{/* Submit button */}
					<Button
						type="submit"
						size="sm"
						disabled={!canSubmit}
						className="gap-1.5"
					>
						{isBusy ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Send className="h-4 w-4" />
						)}
						{replyTo ? "Reply" : "Post"}
					</Button>
				</div>
			</div>
		</form>
	);
}
