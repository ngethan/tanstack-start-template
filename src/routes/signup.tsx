// import { Turnstile } from "@/components/turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { redirectIfAuthenticated } from "@/lib/auth/server";
import { getBaseURL } from "@/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
	// SSR is enabled by default for loaders
	loader: async () => {
		// Server function checks auth and redirects to dashboard if authenticated
		await redirectIfAuthenticated();
		return {};
	},
	component: SignupPage,
});

function SignupPage() {
	const posthog = usePostHog();
	const [isLoading, setIsLoading] = useState(false);
	// const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const getPasswordStrength = (password: string) => {
		if (!password) return { strength: 0, label: "", color: "" };

		let strength = 0;
		if (password.length >= 8) strength++;
		if (password.length >= 12) strength++;
		if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
		if (/\d/.test(password)) strength++;
		if (/[^a-zA-Z\d]/.test(password)) strength++;

		const strengthMap = {
			0: { label: "Very Weak", color: "bg-red-500" },
			1: { label: "Weak", color: "bg-orange-500" },
			2: { label: "Fair", color: "bg-yellow-500" },
			3: { label: "Good", color: "bg-blue-500" },
			4: { label: "Strong", color: "bg-green-500" },
			5: { label: "Very Strong", color: "bg-green-600" },
		};

		return { strength, ...strengthMap[strength as keyof typeof strengthMap] };
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		if (formData.password !== formData.confirmPassword) {
			toast.error("Passwords do not match");
			setIsLoading(false);
			return;
		}

		// Validate password strength
		if (formData.password.length < 8) {
			toast.error("Password must be at least 8 characters long");
			setIsLoading(false);
			return;
		}

		try {
			await authClient.signUp.email(
				{
					email: formData.email,
					password: formData.password,
					name: formData.name,
					// captchaToken: turnstileToken,
					callbackURL: `${getBaseURL()}/login?success=Your email has been verified!`,
				},
				{
					onSuccess: ({ data }) => {
						posthog?.identify(data?.user?.id, {
							email: data?.user?.email,
							name: data?.user?.name,
						});
						posthog?.capture("signed_up");
						toast.success("Please check your inbox for a verification email.");
						setFormData({
							name: "",
							email: "",
							password: "",
							confirmPassword: "",
						});
					},
					onError: (ctx) => {
						toast.error(ctx.error.message);
					},
				},
			);

			setIsLoading(false);
		} catch (err) {
			console.error("Signup error:", err);
			toast.error("An unexpected error occurred. Please try again.");
			setIsLoading(false);
		}
	};

	const handleGoogleSignUp = async () => {
		setIsLoading(true);

		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: "/dashboard",
			});
		} catch (err) {
			console.error("Google signup error:", err);
			toast.error("Failed to sign up with Google. Please try again.");
			setIsLoading(false);
		}
	};

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
							Create your account
						</h1>
						<p className="text-sm text-muted-foreground">
							Already have an account?{" "}
							<Link
								to="/login"
								className="font-medium text-foreground hover:underline"
							>
								Sign in
							</Link>
						</p>
					</div>
				</div>

				<div className="space-y-4">
					<Button
						type="button"
						variant="outline"
						className="w-full h-12"
						onClick={handleGoogleSignUp}
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
							<Label htmlFor="name" className="text-sm font-medium">
								Full name
							</Label>
							<Input
								id="name"
								type="text"
								placeholder="John Doe"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								required
								disabled={isLoading}
								className="h-12"
							/>
						</div>
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
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password" className="text-sm font-medium">
								Password
							</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="At least 8 characters"
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
							{formData.password && (
								<div className="space-y-1">
									<div className="flex gap-1">
										{[...Array(5)].map((_, i) => (
											<div
												key={`strength-${
													// biome-ignore lint/suspicious/noArrayIndexKey: blah blah
													i
												}`}
												className={`h-1 flex-1 rounded-full transition-colors ${
													i < getPasswordStrength(formData.password).strength
														? getPasswordStrength(formData.password).color
														: "bg-muted"
												}`}
											/>
										))}
									</div>
									<p className="text-xs text-muted-foreground">
										Password strength:{" "}
										{getPasswordStrength(formData.password).label}
									</p>
								</div>
							)}
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label
									htmlFor="confirmPassword"
									className="text-sm font-medium"
								>
									Confirm password
								</Label>
								{formData.confirmPassword && (
									<div className="flex items-center gap-1">
										{formData.password === formData.confirmPassword ? (
											<>
												<Check className="h-3 w-3 text-green-600 dark:text-green-400" />
												<span className="text-xs text-green-600 dark:text-green-400">
													Passwords match
												</span>
											</>
										) : (
											<>
												<X className="h-3 w-3 text-red-600 dark:text-red-400" />
												<span className="text-xs text-red-600 dark:text-red-400">
													Passwords don't match
												</span>
											</>
										)}
									</div>
								)}
							</div>
							<div className="relative">
								<Input
									id="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									placeholder="Confirm your password"
									value={formData.confirmPassword}
									onChange={(e) =>
										setFormData({
											...formData,
											confirmPassword: e.target.value,
										})
									}
									required
									disabled={isLoading}
									className={`h-12 pr-12 ${
										formData.confirmPassword
											? formData.password === formData.confirmPassword
												? "border-green-500/50 bg-green-500/5 focus:border-green-500"
												: "border-red-500/50 bg-red-500/5 focus:border-red-500"
											: ""
									}`}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
									tabIndex={-1}
								>
									{showConfirmPassword ? (
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
								isLoading ||
								!formData.name.trim() ||
								!formData.email.trim() ||
								!formData.password ||
								!formData.confirmPassword ||
								formData.password !== formData.confirmPassword
							}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating account...
								</>
							) : (
								"Create account"
							)}
						</Button>
					</form>

					<div className="mt-8 text-xs text-center text-muted-foreground">
						By signing up, you agree to our{" "}
						<Link
							to="/privacy"
							target="_blank"
							className="hover:text-foreground underline hover:no-underline"
						>
							Privacy Policy
						</Link>{" "}
						and{" "}
						<Link
							to="/tos"
							target="_blank"
							className="hover:text-foreground underline hover:no-underline"
						>
							Terms of Service
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
