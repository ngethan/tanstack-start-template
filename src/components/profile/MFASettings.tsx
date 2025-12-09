import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

interface MFASettingsProps {
	hasPasswordAccount: boolean;
	twoFactorEnabled: boolean;
}

export function MFASettings({
	hasPasswordAccount,
	twoFactorEnabled,
}: MFASettingsProps) {
	return (
		<Card className="border rounded-xl">
			<CardHeader>
				<CardTitle className="text-base">
					Multi-Factor Authentication (MFA)
				</CardTitle>
				<CardDescription>
					{hasPasswordAccount
						? "Protect your account by adding an extra layer of security."
						: "MFA requires a password-based account. Link an email/password account to enable mfa."}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{!hasPasswordAccount && (
					<Alert>
						<Lock className="h-4 w-4" />
						<AlertDescription className="space-y-2">
							<p>
								Two-factor authentication requires a password-based account.
							</p>
							<p>
								Since you logged in with a social provider, you'll need to set a
								password first in your Settings page.
							</p>
						</AlertDescription>
					</Alert>
				)}
				<Button variant="contrast" disabled={!hasPasswordAccount}>
					{hasPasswordAccount ? (
						<Link to="/auth/two-factor">
							{twoFactorEnabled ? "Manage MFA" : "Enable MFA"}
						</Link>
					) : (
						<span className="cursor-not-allowed">Enable MFA</span>
					)}
				</Button>
			</CardContent>
		</Card>
	);
}
