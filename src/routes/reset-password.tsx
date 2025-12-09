import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { redirectIfAuthenticated } from "@/lib/auth/server";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
	component: ResetPasswordPage,
	loader: async () => {
		await redirectIfAuthenticated();
		return {};
	},
});

function ResetPasswordPage() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [isReset, setIsReset] = useState(false);
	const [formData, setFormData] = useState({
		password: "",
		confirmPassword: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (formData.password !== formData.confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		if (formData.password.length < 8) {
			toast.error("Password must be at least 8 characters long");
			return;
		}

		setIsLoading(true);

		try {
			const { error } = await authClient.resetPassword({
				newPassword: formData.password,
			});

			if (error) {
				toast.error(
					error.message || "Failed to reset password. Please try again.",
				);
				setIsLoading(false);
				return;
			}

			setIsReset(true);
			toast.success("Password reset successfully!");

			// Redirect to login after 2 seconds
			setTimeout(() => {
				navigate({ to: "/login" });
			}, 2000);
		} catch (err) {
			console.error("Reset password error:", err);
			toast.error("An unexpected error occurred. Please try again.");
			setIsLoading(false);
		}
	};

	if (isReset) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<div className="w-full max-w-md space-y-6">
					<div className="text-center space-y-4">
						<div className="flex justify-center">
							<img
								src="/logo.svg"
								alt="Logo"
								className="w-12 h-12 object-contain"
							/>
						</div>
						<div className="space-y-2">
							<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
								<CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
							</div>
							<h1 className="text-2xl font-semibold tracking-tight">
								Password reset successful
							</h1>
							<p className="text-sm text-muted-foreground">
								Your password has been successfully reset. You will be
								redirected to the login page shortly.
							</p>
						</div>
					</div>

					<Card className="border-0 shadow-none bg-transparent">
						<CardContent className="p-0">
							<Link to="/login">
								<Button type="button" className="w-full h-10">
									Go to sign in
								</Button>
							</Link>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="w-full max-w-md space-y-6">
				<div className="text-center space-y-4">
					<div className="flex justify-center">
						<img
							src="/logo.svg"
							alt="Logo"
							className="w-12 h-12 object-contain"
						/>
					</div>
					<div className="space-y-2">
						<h1 className="text-2xl font-semibold tracking-tight">
							Reset your password
						</h1>
						<p className="text-sm text-muted-foreground">
							Enter your new password below. Make sure it's at least 8
							characters long.
						</p>
					</div>
				</div>

				<Card className="border-0 shadow-none bg-transparent">
					<CardContent className="p-0">
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="password" className="text-sm font-medium">
									New password
								</Label>
								<Input
									id="password"
									type="password"
									value={formData.password}
									onChange={(e) =>
										setFormData({ ...formData, password: e.target.value })
									}
									required
									disabled={isLoading}
									autoFocus
									minLength={8}
									placeholder="Enter your new password"
									className="h-10"
								/>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="confirmPassword"
									className="text-sm font-medium"
								>
									Confirm new password
								</Label>
								<Input
									id="confirmPassword"
									type="password"
									value={formData.confirmPassword}
									onChange={(e) =>
										setFormData({
											...formData,
											confirmPassword: e.target.value,
										})
									}
									required
									disabled={isLoading}
									minLength={8}
									placeholder="Confirm your new password"
									className="h-10"
								/>
							</div>

							<Button
								type="submit"
								className="w-full h-10"
								disabled={
									isLoading ||
									!formData.password ||
									!formData.confirmPassword ||
									formData.password !== formData.confirmPassword ||
									formData.password.length < 8
								}
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Resetting password...
									</>
								) : (
									"Reset password"
								)}
							</Button>
						</form>

						<div className="mt-4 text-center">
							<Link
								to="/login"
								className="text-sm text-muted-foreground hover:text-primary font-medium"
							>
								Back to sign in
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
