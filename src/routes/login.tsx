// import { Turnstile } from "@/components/turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { redirectIfAuthenticated } from "@/lib/auth/server";
import { getBaseURL } from "@/lib/utils";
import { Link, createFileRoute, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
	loader: async () => {
		await redirectIfAuthenticated();
		return {};
	},
	component: LoginPage,
});

function LoginPage() {
	const posthog = usePostHog();
	const search = useSearch({ from: "/login" });
	const [isLoading, setIsLoading] = useState(false);
	// const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	// Show success toast if success param is present
	useEffect(() => {
		const successMessage = (search as { success: string })?.success;
		if (successMessage) {
			const cleanMessage = successMessage.replace(/^'|'$/g, "");
			toast.success(cleanMessage);

			const url = new URL(window.location.href);
			url.searchParams.delete("success");
			window.history.replaceState({}, "", url.toString());
		}
	}, [search]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await authClient.signIn.email(
				{
					email: formData.email,
					password: formData.password,
					// captchaToken: turnstileToken,
					callbackURL: "/dashboard",
				},
				{
					onSuccess: ({ data }) => {
						posthog?.identify(data?.user?.id, {
							email: data?.user?.email,
							name: data?.user?.name,
						});
						posthog?.capture("logged_in");
					},
					onError: (ctx) => {
						if (ctx.error.status === 403) {
							toast.error("Please verify your email address", {
								description: (
									<button
										type="button"
										onClick={async () => {
											const { error } = await authClient.sendVerificationEmail({
												email: formData.email,
												callbackURL: `${getBaseURL()}/login?success=Your email has been verified!`,
											});
											if (error) {
												toast.error(error.message);
											} else {
												toast.success("Verification email sent!");
											}
										}}
										className="underline hover:no-underline cursor-pointer"
									>
										Resend verification email
									</button>
								),
							});
						} else {
							toast.error(ctx.error.message);
						}
					},
				},
			);

			setIsLoading(false);
		} catch (err) {
			console.error("Login error:", err);
			toast.error("An unexpected error occurred. Please try again.");
			setIsLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setIsLoading(true);

		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: "/dashboard",
			});
		} catch (err) {
			console.error("Google signin error:", err);
			toast.error("Failed to sign in with Google. Please try again.");
			setIsLoading(false);
		}
	};

	// useEffect(() => {
	// 	if (
	// 		!PublicKeyCredential.isConditionalMediationAvailable ||
	// 		!PublicKeyCredential.isConditionalMediationAvailable()
	// 	) {
	// 		return;
	// 	}
	// 	void authClient.signIn.passkey({ autoFill: true });
	// }, []);

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
			<Link
				to="/"
				className="absolute top-8 left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
			>
				<ArrowLeft className="h-4 w-4" />
				Home
			</Link>

			<div className="w-full max-w-lg space-y-6 relative z-10">
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
							Sign in to your account
						</h1>
						<p className="text-sm text-muted-foreground">
							Don't have an account?{" "}
							<Link
								to="/signup"
								className="font-medium text-foreground hover:underline"
							>
								Sign up
							</Link>
						</p>
					</div>
				</div>

				<div className="space-y-4">
					<Button
						type="button"
						variant="outline"
						className="w-full h-12"
						onClick={handleGoogleSignIn}
						disabled={isLoading}
					>
						<svg
							className="mr-2 h-4 w-4"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
						>
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
						Google
					</Button>

					<div className="flex items-center gap-3 text-xs uppercase">
						<span className="h-px flex-1 bg-gradient-to-r from-transparent via-border/60 to-border" />
						<span className="shrink-0 text-muted-foreground">or</span>
						<span className="h-px flex-1 bg-gradient-to-l from-transparent via-border/60 to-border" />
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email" className="text-sm font-medium">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="name@example.com"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								required
								disabled={isLoading}
								className="h-12"
								autoComplete="webauthn"
							/>
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password" className="text-sm font-medium">
									Password
								</Label>
								<Link
									to="/forgot-password"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									tabIndex={-1}
								>
									Forgot password?
								</Link>
							</div>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									value={formData.password}
									onChange={(e) =>
										setFormData({ ...formData, password: e.target.value })
									}
									required
									disabled={isLoading}
									className="h-12 pr-12"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
									tabIndex={-1}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						{/* <Turnstile
								onVerify={(token) => setTurnstileToken(token)}
								onError={() =>
									toast.error("Security verification failed. Please try again.")
								}
								onExpire={() => setTurnstileToken(null)}
							/> */}

						<Button
							type="submit"
							className="w-full h-12"
							disabled={
								isLoading || !formData.email.trim() || !formData.password
							}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing in...
								</>
							) : (
								"Sign in"
							)}
						</Button>
					</form>

					<p className="text-xs text-center text-muted-foreground mt-8">
						By signing in, you agree to our{" "}
						<Link
							to="/tos"
							target="_blank"
							className="underline hover:text-foreground"
						>
							Terms
						</Link>{" "}
						and{" "}
						<Link
							to="/privacy"
							target="_blank"
							className="hover:text-foreground underline"
						>
							Privacy Policy
						</Link>
						.
					</p>
				</div>
			</div>
		</div>
	);
}
