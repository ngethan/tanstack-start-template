import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { requireAuth } from "@/lib/auth/server";
import { hasPasswordAccount } from "@/lib/auth/utils";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
	AlertCircle,
	Copy,
	Info,
	Loader2,
	Lock,
	Shield,
	ShieldOff,
	Smartphone,
} from "lucide-react";
import { useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/two-factor")({
	loader: async () => {
		const user = await requireAuth();
		// Also fetch accounts to check if user has password
		const accounts = await authClient.listAccounts();
		return { user, accounts: accounts.data || [] };
	},
	component: TwoFactorSettings,
});

function TwoFactorSettings() {
	const router = useRouter();
	const { user, accounts } = Route.useLoaderData();
	const userInfo = user.user;

	const [isSetupOpen, setIsSetupOpen] = useState(false);
	const [isDisableOpen, setIsDisableOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [totpUri, setTotpUri] = useState("");
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [verificationCode, setVerificationCode] = useState("");
	const [password, setPassword] = useState("");

	// Check if user has password account from loader data
	const hasPasswordAcct = hasPasswordAccount(accounts);
	const isTwoFactorEnabled = userInfo.twoFactorEnabled || false;

	const handleEnable2FA = async () => {
		if (!password) {
			toast.error("Please enter your password");
			return;
		}

		setLoading(true);
		try {
			const { data, error } = await authClient.twoFactor.enable({
				password,
			});

			if (error) {
				toast.error(
					error.message ||
						"Failed to enable 2FA. Make sure your password is correct.",
				);
				return;
			}

			if (data) {
				setTotpUri(data.totpURI);
				setBackupCodes(data.backupCodes || []);
				setPassword("");
			}
		} catch (error) {
			toast.error("An error occurred while enabling 2FA");
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyAndComplete = async () => {
		if (!verificationCode || verificationCode.length !== 6) {
			toast.error("Please enter a valid 6-digit code");
			return;
		}

		setLoading(true);
		try {
			const { data, error } = await authClient.twoFactor.verifyTotp({
				code: verificationCode,
			});

			if (error) {
				toast.error(error.message || "Invalid verification code");
				return;
			}

			if (data) {
				toast.success("Two-factor authentication enabled successfully!");
				setIsSetupOpen(false);
				setVerificationCode("");
				setTotpUri("");
				setBackupCodes([]);
				// Refresh the page to update the user state
				await router.invalidate();
			}
		} catch (error) {
			toast.error("Failed to verify code");
		} finally {
			setLoading(false);
		}
	};

	const handleDisable2FA = async () => {
		if (!password) {
			toast.error("Please enter your password");
			return;
		}

		setLoading(true);
		try {
			const { data, error } = await authClient.twoFactor.disable({
				password,
			});

			if (error) {
				toast.error(
					error.message ||
						"Failed to disable 2FA. Make sure your password is correct.",
				);
				return;
			}

			if (data) {
				toast.success("Two-factor authentication disabled");
				setIsDisableOpen(false);
				setPassword("");
				// Refresh the page to update the user state
				await router.invalidate();
			}
		} catch (error) {
			toast.error("Failed to disable 2FA");
		} finally {
			setLoading(false);
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard");
	};

	const copyAllBackupCodes = () => {
		const codes = backupCodes.join("\n");
		navigator.clipboard.writeText(codes);
		toast.success("All backup codes copied to clipboard");
	};

	// Extract secret from TOTP URI
	const extractSecret = (uri: string) => {
		const match = uri.match(/secret=([A-Z2-7]+)/);
		return match ? match[1] : "";
	};

	const handleOpenSetup = () => {
		if (!hasPasswordAcct) {
			toast.error(
				"You need a password-based account to enable 2FA. Please set a password in Settings first.",
			);
			return;
		}
		setIsSetupOpen(true);
	};

	return (
		<div className="container mx-auto max-w-4xl py-8 px-4">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						Two-Factor Authentication
					</CardTitle>
					<CardDescription>
						Add an extra layer of security to your account by enabling
						two-factor authentication
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<Smartphone className="h-4 w-4 text-muted-foreground" />
								<p className="text-sm font-medium">Authenticator App</p>
							</div>
							<p className="text-sm text-muted-foreground">
								{isTwoFactorEnabled
									? "Your account is protected with 2FA"
									: "Use an authenticator app to generate verification codes"}
							</p>
						</div>
						<Button
							onClick={() =>
								isTwoFactorEnabled ? setIsDisableOpen(true) : handleOpenSetup()
							}
							variant={isTwoFactorEnabled ? "destructive" : "default"}
							disabled={!hasPasswordAcct && !isTwoFactorEnabled}
						>
							{isTwoFactorEnabled ? (
								<>
									<ShieldOff className="h-4 w-4 mr-2" />
									Disable
								</>
							) : (
								<>
									<Shield className="h-4 w-4 mr-2" />
									Enable
								</>
							)}
						</Button>
					</div>

					{isTwoFactorEnabled && (
						<div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4 flex items-start gap-3">
							<Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
							<div className="space-y-1">
								<p className="text-sm font-medium text-green-900 dark:text-green-100">
									Two-factor authentication is enabled
								</p>
								<p className="text-sm text-green-700 dark:text-green-300">
									Your account has an additional layer of security
								</p>
							</div>
						</div>
					)}

					{!hasPasswordAcct && !isTwoFactorEnabled && (
						<Alert>
							<Lock className="h-4 w-4" />
							<AlertDescription className="space-y-2">
								<p>
									Two-factor authentication requires a password-based account.
								</p>
								<p>
									Since you logged in with a social provider, you'll need to set
									a password first in your Settings page.
								</p>
							</AlertDescription>
						</Alert>
					)}

					{hasPasswordAcct && !isTwoFactorEnabled && (
						<Alert>
							<Info className="h-4 w-4" />
							<AlertDescription>
								Enhance your account security by enabling two-factor
								authentication. You'll need an authenticator app like Google
								Authenticator or Authy on your phone.
							</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>

			{/* Setup 2FA Dialog */}
			<Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Enable Two-Factor Authentication</DialogTitle>
						<DialogDescription>
							{!totpUri
								? "Enter your password to begin setup"
								: "Scan the QR code with your authenticator app"}
						</DialogDescription>
					</DialogHeader>

					{!totpUri ? (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="setup-password">Password</Label>
								<Input
									id="setup-password"
									type="password"
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setIsSetupOpen(false)}>
									Cancel
								</Button>
								<Button onClick={handleEnable2FA} disabled={loading}>
									{loading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Verifying...
										</>
									) : (
										"Continue"
									)}
								</Button>
							</DialogFooter>
						</div>
					) : (
						<div className="space-y-6">
							<div className="space-y-4">
								<div className="bg-white p-4 rounded-lg flex justify-center">
									<QRCode value={totpUri} size={200} />
								</div>

								<div className="space-y-2">
									<Label>Secret Key</Label>
									<div className="flex gap-2">
										<Input
											value={extractSecret(totpUri)}
											readOnly
											className="font-mono text-xs"
										/>
										<Button
											size="icon"
											variant="outline"
											onClick={() => copyToClipboard(extractSecret(totpUri))}
										>
											<Copy className="h-4 w-4" />
										</Button>
									</div>
									<p className="text-xs text-muted-foreground">
										Save this key in case you need to manually add the account
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="verification-code">Verification Code</Label>
									<Input
										id="verification-code"
										placeholder="Enter 6-digit code"
										value={verificationCode}
										onChange={(e) => setVerificationCode(e.target.value)}
										maxLength={6}
									/>
								</div>
							</div>

							{backupCodes.length > 0 && (
								<div className="space-y-3 border rounded-lg p-4 bg-muted/30">
									<div className="flex items-start gap-2">
										<AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
										<div className="space-y-2 flex-1">
											<p className="text-sm font-medium">Backup Codes</p>
											<p className="text-xs text-muted-foreground">
												Save these codes in a secure place. Each code can only
												be used once.
											</p>
											<div className="grid grid-cols-2 gap-2 mt-3">
												{backupCodes.map((code) => (
													<div
														key={code}
														className="font-mono text-xs bg-background rounded px-2 py-1"
													>
														{code}
													</div>
												))}
											</div>
											<Button
												size="sm"
												variant="outline"
												onClick={copyAllBackupCodes}
												className="mt-2"
											>
												<Copy className="h-3 w-3 mr-2" />
												Copy All Codes
											</Button>
										</div>
									</div>
								</div>
							)}

							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => {
										setIsSetupOpen(false);
										setTotpUri("");
										setBackupCodes([]);
										setVerificationCode("");
									}}
								>
									Cancel
								</Button>
								<Button
									onClick={handleVerifyAndComplete}
									disabled={loading || !verificationCode}
								>
									{loading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Verifying...
										</>
									) : (
										"Verify & Enable"
									)}
								</Button>
							</DialogFooter>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Disable 2FA Dialog */}
			<Dialog open={isDisableOpen} onOpenChange={setIsDisableOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Disable Two-Factor Authentication</DialogTitle>
						<DialogDescription>
							Enter your password to disable 2FA. This will make your account
							less secure.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4 flex items-start gap-3">
							<AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
							<div className="space-y-1">
								<p className="text-sm font-medium text-amber-900 dark:text-amber-100">
									Security Warning
								</p>
								<p className="text-sm text-amber-700 dark:text-amber-300">
									Disabling 2FA will remove an important security layer from
									your account
								</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="disable-password">Password</Label>
							<Input
								id="disable-password"
								type="password"
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>

						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => {
									setIsDisableOpen(false);
									setPassword("");
								}}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={handleDisable2FA}
								disabled={loading || !password}
							>
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Disabling...
									</>
								) : (
									"Disable 2FA"
								)}
							</Button>
						</DialogFooter>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
