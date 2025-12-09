import { useAuth } from "@/hooks/use-auth";
import * as Sentry from "@sentry/tanstackstart-react";
import { Bug, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export function BugReportDialog() {
	const { session } = useAuth();
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		name: session?.user?.name || "",
		email: session?.user?.email || "",
		message: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const eventId = Sentry.lastEventId();
			const userFeedback = {
				name: formData.name,
				email: formData.email,
				message: formData.message,
				associatedEventId: eventId,
			};

			Sentry.captureFeedback(userFeedback);

			// Reset form and close dialog
			setFormData({
				name: session?.user?.name || "",
				email: session?.user?.email || "",
				message: "",
			});
			setOpen(false);
			toast.success(
				"Bug report submitted successfully. Thank you for your feedback!",
			);
		} catch (error) {
			console.error("Failed to submit bug report:", error);
			toast.error("Failed to submit bug report. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="w-full justify-start hover:bg-gray-300/50 hover:text-accent-foreground dark:hover:bg-white/10 cursor-default font-[400]"
				>
					<Bug className="mr-2 h-4 w-4 text-muted-foreground" />
					Report a Bug
				</Button>
			</DialogTrigger>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Report a Bug</DialogTitle>
						<DialogDescription>
							Help us improve by reporting any issues you encounter. We'll look
							into it right away.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								disabled={true}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								disabled={true}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="message">Describe the issue</Label>
							<Textarea
								id="message"
								value={formData.message}
								onChange={(e) =>
									setFormData({ ...formData, message: e.target.value })
								}
								placeholder="Please describe what went wrong, what you expected to happen, and steps to reproduce the issue..."
								className="min-h-[120px]"
								required
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							<Send className="h-4 w-4" />
							Send Report
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
