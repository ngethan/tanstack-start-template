import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { redirectIfAuthenticated } from "@/lib/auth/server";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Clock, Loader2, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
	loader: async () => {
		await redirectIfAuthenticated();
		return {};
	},
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [email, setEmail] = useState("");
	const [resendTimer, setResendTimer] = useState(0);

	useEffect(() => {
		if (resendTimer > 0) {
			const timer = setTimeout(() => {
				setResendTimer(resendTimer - 1);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [resendTimer]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const { error } = await authClient.forgetPassword({
				email,
				redirectTo: "/reset-password",
			});

			if (error) {
				toast.error(
					error.message || "Failed to send reset email. Please try again.",
				);
				setIsLoading(false);
				return;
			}

			setIsSubmitted(true);
			setResendTimer(60); // Start 60-second timer
			setIsLoading(false); // Stop loading state
			toast.success("Password reset email sent successfully!");
		} catch (err) {
			console.error("Forgot password error:", err);
			toast.error("An unexpected error occurred. Please try again.");
			setIsLoading(false);
		}
	};

	if (isSubmitted) {
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
								<Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
							</div>
							<h1 className="text-2xl font-semibold tracking-tight">
								Check your email
							</h1>
							<p className="text-sm text-muted-foreground">
								We've sent a password reset link to{" "}
								<span className="font-medium text-foreground">{email}</span>
							</p>
						</div>
					</div>

					<Card className="border-0! shadow-none! bg-transparent">
						<CardContent className="p-0 space-y-4">
							<p className="text-sm text-muted-foreground text-center">
								Click the link in the email to reset your password. If you don't
								see the email, check your spam folder.
							</p>
							<Button
								type="button"
								variant="outline"
								className="w-full h-12"
								onClick={async () => {
									if (resendTimer > 0) return;

									setIsLoading(true);
									try {
										const { error } = await authClient.forgetPassword({
											email,
											redirectTo: "/reset-password",
										});

										if (error) {
											toast.error(
												error.message || "Failed to send reset email.",
											);
											setIsLoading(false);
											return;
										}

										setResendTimer(60); // Restart timer
										toast.success("Password reset email sent again!");
										setIsLoading(false);
									} catch (err) {
										console.error("Resend email error:", err);
										toast.error("Failed to resend email. Please try again.");
										setIsLoading(false);
									}
								}}
								disabled={resendTimer > 0 || isLoading}
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Sending...
									</>
								) : resendTimer > 0 ? (
									<>
										<Clock className="mr-2 h-4 w-4" />
										Resend verification email ({resendTimer}s)
									</>
								) : (
									"Resend verification email"
								)}
							</Button>

							<div className="text-center">
								<Link
									to="/login"
									className="text-sm text-primary hover:underline font-medium"
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
							Forgot your password?
						</h1>
						<p className="text-sm text-muted-foreground">
							Enter your email address and we'll send you a link to reset your
							password.
						</p>
					</div>
				</div>

				<Card className="border-0! shadow-none! bg-transparent!">
					<CardContent className="p-0">
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email" className="text-sm font-medium">
									Email
								</Label>
								<Input
									id="email"
									type="email"
									placeholder="name@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									disabled={isLoading}
									autoFocus
									className="h-12"
								/>
							</div>

							<Button
								type="submit"
								className="w-full h-12"
								disabled={isLoading || !email.trim()}
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Sending reset link...
									</>
								) : (
									"Send reset link"
								)}
							</Button>
						</form>

						<div className="mt-4 text-center">
							<Link
								to="/login"
								className="text-sm text-muted-foreground hover:text-foreground font-medium inline-flex items-center gap-1"
							>
								<ArrowLeft className="h-3 w-3" />
								Back to sign in
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
