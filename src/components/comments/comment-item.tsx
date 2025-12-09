import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface CommentWithMeta {
	id: string;
	postId: string;
	userId: string;
	content: string;
	imageUrl: string | null;
	gifUrl: string | null;
	parentId: string | null;
	createdAt: Date;
	updatedAt?: Date | null;
	deletedAt: Date | null;
	user: {
		id: string;
		name: string;
		image: string | null;
	};
	likeCount: number;
	replyCount: number;
	isLiked: boolean;
	isDeleted: boolean;
}
import { formatDistanceToNow } from "date-fns";
import {
	Check,
	Heart,
	MessageCircle,
	MoreHorizontal,
	Pencil,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";

const MAX_CHARS = 500;

interface CommentItemProps {
	comment: CommentWithMeta;
	currentUserId?: string;
	onLike: (commentId: string) => void;
	onReply: (comment: CommentWithMeta) => void;
	onDelete: (commentId: string) => void;
	onEdit?: (commentId: string, content: string) => Promise<void>;
	onViewReplies?: (commentId: string) => void;
	isLiking?: boolean;
	isDeleting?: boolean;
	isEditing?: boolean;
	isReply?: boolean;
}

export function CommentItem({
	comment,
	currentUserId,
	onLike,
	onReply,
	onDelete,
	onEdit,
	onViewReplies,
	isLiking,
	isDeleting,
	isEditing,
	isReply = false,
}: CommentItemProps) {
	const isOwner = currentUserId === comment.user.id;
	const isDeleted = comment.isDeleted;
	const [editMode, setEditMode] = useState(false);
	const [editContent, setEditContent] = useState(comment.content);

	const charsRemaining = MAX_CHARS - editContent.length;
	const isOverLimit = charsRemaining < 0;
	const canSave =
		editContent.trim().length > 0 &&
		!isOverLimit &&
		editContent !== comment.content;

	const handleSaveEdit = async () => {
		if (!canSave || !onEdit) return;
		await onEdit(comment.id, editContent.trim());
		setEditMode(false);
	};

	const handleCancelEdit = () => {
		setEditContent(comment.content);
		setEditMode(false);
	};

	const initials = comment.user.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	// Deleted comment display
	if (isDeleted) {
		return (
			<div className={cn("flex gap-3", isReply && "ml-10")}>
				<Avatar className="h-8 w-8 flex-shrink-0 opacity-50">
					<AvatarFallback className="text-xs">?</AvatarFallback>
				</Avatar>

				<div className="flex-1 min-w-0">
					<div className="rounded-xl bg-muted/30 px-3 py-2">
						<p className="text-sm text-muted-foreground italic">
							[Comment deleted by user]
						</p>
					</div>

					{/* Still show replies button for deleted comments */}
					{!isReply && comment.replyCount > 0 && onViewReplies && (
						<div className="flex items-center gap-1 mt-1 ml-1">
							<Button
								variant="ghost"
								size="sm"
								className="h-7 px-2 text-xs text-primary"
								onClick={() => onViewReplies(comment.id)}
							>
								{comment.replyCount}{" "}
								{comment.replyCount === 1 ? "reply" : "replies"}
							</Button>
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className={cn("flex gap-3", isReply && "ml-10")}>
			<Avatar className="h-8 w-8 flex-shrink-0">
				<AvatarImage
					src={comment.user.image ?? undefined}
					alt={comment.user.name}
				/>
				<AvatarFallback className="text-xs">{initials}</AvatarFallback>
			</Avatar>

			<div className="flex-1 min-w-0">
				<div className="rounded-xl bg-muted/50 px-3 py-2">
					<div className="flex items-center gap-2 mb-1">
						<span className="font-medium text-sm text-foreground">
							{comment.user.name}
						</span>
						<span className="text-xs text-muted-foreground">
							{formatDistanceToNow(new Date(comment.createdAt), {
								addSuffix: true,
							})}
						</span>
						{comment.updatedAt &&
							new Date(comment.updatedAt).getTime() -
								new Date(comment.createdAt).getTime() >
								1000 && (
								<span className="text-xs text-muted-foreground italic">
									(edited)
								</span>
							)}
					</div>

					{editMode ? (
						<div className="space-y-2">
							<div className="relative">
								<Textarea
									value={editContent}
									onChange={(e) => setEditContent(e.target.value)}
									rows={2}
									className="resize-none pr-12 min-h-[60px] text-sm"
									disabled={isEditing}
									autoFocus
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
							<div className="flex items-center gap-1">
								<Button
									size="sm"
									className="h-7 px-2 text-xs gap-1"
									onClick={handleSaveEdit}
									disabled={!canSave || isEditing}
								>
									<Check className="h-3.5 w-3.5" />
									Save
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="h-7 px-2 text-xs gap-1"
									onClick={handleCancelEdit}
									disabled={isEditing}
								>
									<X className="h-3.5 w-3.5" />
									Cancel
								</Button>
							</div>
						</div>
					) : (
						<p className="text-sm text-foreground whitespace-pre-wrap break-words">
							{comment.content}
						</p>
					)}

					{/* Image attachment */}
					{comment.imageUrl && (
						<div className="mt-2">
							<img
								src={comment.imageUrl}
								alt="Comment attachment"
								className="max-w-full max-h-64 rounded-lg object-contain"
							/>
						</div>
					)}

					{/* GIF attachment */}
					{comment.gifUrl && (
						<div className="mt-2">
							<img
								src={comment.gifUrl}
								alt="GIF"
								className="max-w-full max-h-48 rounded-lg"
							/>
						</div>
					)}
				</div>

				{/* Actions */}
				<div className="flex items-center gap-1 mt-1 ml-1">
					<Button
						variant="ghost"
						size="sm"
						className={cn(
							"h-7 px-2 text-xs gap-1",
							comment.isLiked && "text-red-500",
						)}
						onClick={() => onLike(comment.id)}
						disabled={isLiking || !currentUserId}
					>
						<Heart
							className={cn("h-3.5 w-3.5", comment.isLiked && "fill-current")}
						/>
						{comment.likeCount > 0 && <span>{comment.likeCount}</span>}
					</Button>

					{!isReply && (
						<Button
							variant="ghost"
							size="sm"
							className="h-7 px-2 text-xs gap-1"
							onClick={() => onReply(comment)}
							disabled={!currentUserId}
						>
							<MessageCircle className="h-3.5 w-3.5" />
							Reply
						</Button>
					)}

					{/* View replies */}
					{!isReply && comment.replyCount > 0 && onViewReplies && (
						<Button
							variant="ghost"
							size="sm"
							className="h-7 px-2 text-xs text-primary"
							onClick={() => onViewReplies(comment.id)}
						>
							{comment.replyCount}{" "}
							{comment.replyCount === 1 ? "reply" : "replies"}
						</Button>
					)}

					{/* Owner actions */}
					{isOwner && !editMode && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm" className="h-7 w-7 p-0">
									<MoreHorizontal className="h-3.5 w-3.5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start">
								{onEdit && (
									<DropdownMenuItem
										onClick={() => setEditMode(true)}
										disabled={isEditing}
									>
										<Pencil className="h-4 w-4 mr-2" />
										Edit
									</DropdownMenuItem>
								)}
								<DropdownMenuItem
									onClick={() => onDelete(comment.id)}
									disabled={isDeleting}
									className="text-destructive focus:text-destructive"
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</div>
		</div>
	);
}
