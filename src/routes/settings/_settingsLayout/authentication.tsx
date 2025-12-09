import { AccountSettings } from "@/components/profile/AccountSettings";
import { EmailSettings } from "@/components/profile/EmailSettings";
import { MFASettings } from "@/components/profile/MFASettings";
// import { PasskeySettings } from "@/components/profile/PasskeySettings";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireAuth } from "@/lib/auth/server";
import { fetchUserAccounts } from "@/lib/auth/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute(
	"/settings/_settingsLayout/authentication",
)({
	loader: async () => {
		const user = await requireAuth();
		return { user };
	},
	component: AuthenticationSettings,
});

function AuthenticationSettings() {
	const data = Route.useLoaderData();
	const user = data.user.user;
	const [hasPasswordAccount, setHasPasswordAccount] = useState(false);

	useEffect(() => {
		checkPasswordAccount();
	}, []);

	const checkPasswordAccount = async () => {
		const { hasPasswordAccount } = await fetchUserAccounts();
		setHasPasswordAccount(hasPasswordAccount);
	};

	return (
		<div className="rounded-lg border bg-card">
			<div className="p-6">
				<div>
					<h2 className="text-2xl font-semibold tracking-tight">
						Authentication & Security
					</h2>
					<p className="text-muted-foreground">
						Manage your account security and authentication methods
					</p>
				</div>

				<Separator className="my-6" />

				<div className="space-y-6">
					<EmailSettings currentEmail={user.email} />

					<AccountSettings />

					<MFASettings
						hasPasswordAccount={hasPasswordAccount}
						twoFactorEnabled={user.twoFactorEnabled || false}
					/>

					{/* <PasskeySettings /> */}

					<Card className="border rounded-xl border-destructive/50">
						<CardHeader>
							<CardTitle className="text-base text-destructive">
								Delete Account
							</CardTitle>
							<CardDescription>
								Permanently delete your account and all associated data. This
								action cannot be undone.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-4">
								Accounts can only be deleted when there are no more teams
								associated with it. Please leave all{" "}
								<Link
									to="/settings/teams"
									className="text-primary hover:underline"
								>
									teams
								</Link>{" "}
								before deleting your account.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
