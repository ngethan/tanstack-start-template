import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth/client";
import { fetchUserAccounts, getProviderName } from "@/lib/auth/utils";
import type { Account } from "better-auth";
import { Github, Loader2, Mail, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function AccountSettings() {
	const [accounts, setAccounts] = useState<Omit<Account, "userId">[]>([]);
	const [loadingAccounts, setLoadingAccounts] = useState(true);

	useEffect(() => {
		fetchAccounts();
	}, []);

	const fetchAccounts = async () => {
		setLoadingAccounts(true);
		try {
			const { accounts } = await fetchUserAccounts();
			setAccounts(accounts);
		} finally {
			setLoadingAccounts(false);
		}
	};

	const handleLinkProvider = async (
		provider: "github" | "google" | "microsoft",
	) => {
		try {
			await authClient.linkSocial({ provider });
			// The page will redirect to the provider
		} catch (err) {
			console.error("Link provider error:", err);
			toast.error("Failed to link provider");
		}
	};

	const handleUnlinkAccount = async (
		providerId: string,
		accountId?: string,
	) => {
		if (accounts.length <= 1) {
			toast.error("Cannot unlink your last account");
			return;
		}

		try {
			const { data, error } = await authClient.unlinkAccount({
				providerId,
				accountId,
			});

			if (error) {
				toast.error(error.message || "Failed to unlink account");
				return;
			}

			if (data) {
				toast.success("Account unlinked successfully");
				await fetchAccounts();
			}
		} catch (err) {
			console.error("Unlink account error:", err);
			toast.error("Failed to unlink account");
		}
	};

	const getProviderIcon = (provider: string) => {
		switch (provider) {
			case "github":
				return <Github className="h-5 w-5" />;
			case "google":
				return (
					<svg className="h-5 w-5" viewBox="0 0 24 24" aria-label="Google logo">
						<title>Google</title>
						<path
							fill="#4285F4"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
						<path
							fill="#34A853"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						/>
						<path
							fill="#FBBC05"
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						/>
						<path
							fill="#EA4335"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						/>
					</svg>
				);
			case "microsoft":
				return (
					<svg
						className="h-5 w-5"
						viewBox="0 0 24 24"
						aria-label="Microsoft logo"
					>
						<title>Microsoft</title>
						<path fill="#F25022" d="M11.4 11.4H0V0h11.4z" />
						<path fill="#7FBA00" d="M24 11.4H12.6V0H24z" />
						<path fill="#00A4EF" d="M11.4 24H0V12.6h11.4z" />
						<path fill="#FFB900" d="M24 24H12.6V12.6H24z" />
					</svg>
				);
			case "credential":
				return <Mail className="h-5 w-5" />;
			default:
				return <Mail className="h-5 w-5" />;
		}
	};

	return (
		<Card className="border rounded-xl">
			<CardHeader>
				<CardTitle className="text-base">Authentication</CardTitle>
				<CardDescription>
					Manage your linked authentication providers.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{loadingAccounts ? (
					<div className="flex items-center justify-center py-4">
						<Loader2 className="h-6 w-6 animate-spin" />
					</div>
				) : (
					<>
						<div className="space-y-2">
							{accounts.map((account) => (
								<div
									key={account.id}
									className="border border-foreground/10 rounded-lg p-4"
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
												{getProviderIcon(account.providerId)}
											</div>
											<div>
												<p className="font-medium text-sm">
													{getProviderName(account.providerId)}
												</p>
												<p className="text-xs text-muted-foreground">
													Connected on{" "}
													{new Date(account.createdAt).toLocaleDateString(
														"en-US",
														{
															month: "short",
															day: "numeric",
															year: "numeric",
														},
													)}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{accounts.length > 1 && (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() =>
														handleUnlinkAccount(
															account.providerId,
															account.accountId,
														)
													}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</div>
									</div>
								</div>
							))}
						</div>

						<div className="flex gap-3 flex-wrap">
							{!accounts.some((a) => a.providerId === "github") && (
								<Button
									onClick={() => handleLinkProvider("github")}
									variant="contrast"
								>
									<Github className="mr-2 h-4 w-4" />
									Link GitHub
								</Button>
							)}
							{!accounts.some((a) => a.providerId === "google") && (
								<Button
									onClick={() => handleLinkProvider("google")}
									variant="secondary"
								>
									<svg
										className="mr-2 h-4 w-4"
										viewBox="0 0 24 24"
										aria-label="Google logo"
									>
										<title>Google</title>
										<path
											fill="#4285F4"
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										/>
										<path
											fill="#34A853"
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										/>
										<path
											fill="#FBBC05"
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										/>
										<path
											fill="#EA4335"
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										/>
									</svg>
									Link Google
								</Button>
							)}
							{!accounts.some((a) => a.providerId === "microsoft") && (
								<Button
									onClick={() => handleLinkProvider("microsoft")}
									variant="secondary"
								>
									<svg
										className="mr-2 h-4 w-4"
										viewBox="0 0 24 24"
										aria-label="Microsoft logo"
									>
										<title>Microsoft</title>
										<path fill="#F25022" d="M11.4 11.4H0V0h11.4z" />
										<path fill="#7FBA00" d="M24 11.4H12.6V0H24z" />
										<path fill="#00A4EF" d="M11.4 24H0V12.6h11.4z" />
										<path fill="#FFB900" d="M24 24H12.6V12.6H24z" />
									</svg>
									Link Microsoft
								</Button>
							)}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
