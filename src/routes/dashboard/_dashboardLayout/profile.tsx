import { AccountSettings } from "@/components/profile/AccountSettings";
import { EmailSettings } from "@/components/profile/EmailSettings";
import { MFASettings } from "@/components/profile/MFASettings";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { requireAuth } from "@/lib/auth/server";
import { fetchUserAccounts } from "@/lib/auth/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard/_dashboardLayout/profile")({
	loader: async () => {
		const user = await requireAuth();
		return { user };
	},
	component: ProfilePage,
});

function ProfilePage() {
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
		<div className="p-6 space-y-8">
			<h1 className="text-2xl font-semibold mb-8">Profile</h1>

			<div className="space-y-6">
				<EmailSettings currentEmail={user.email} />

				<Card className="border rounded-xl">
					<CardHeader>
						<CardTitle className="text-base">Invites</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							There are no pending invites.
						</p>
					</CardContent>
				</Card>

				<Card className="border rounded-xl">
					<CardHeader>
						<CardTitle className="text-base">Teams</CardTitle>
						<CardDescription>
							The teams that are associated with your account.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="border rounded-lg p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Avatar className="h-10 w-10 rounded-lg bg-zinc-800">
										<AvatarFallback className="rounded-lg bg-zinc-800 text-white text-xs">
											A
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium text-sm">My Organization</p>
										<p className="text-xs text-muted-foreground">
											Joined on{" "}
											{new Date(user.createdAt).toLocaleDateString("en-US", {
												month: "long",
												day: "numeric",
												year: "numeric",
											})}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<span className="text-sm text-muted-foreground">Admin</span>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<AccountSettings />

				<MFASettings
					hasPasswordAccount={hasPasswordAccount}
					twoFactorEnabled={user.twoFactorEnabled || false}
				/>

				<Card className="border rounded-xl">
					<CardHeader>
						<CardTitle className="text-base">Delete Account</CardTitle>
						<CardDescription>
							Accounts can only be deleted when there are no more teams still
							associated with it.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							Please leave all{" "}
							<Link to="/dashboard" className="text-primary hover:underline">
								teams
							</Link>{" "}
							before deleting your account.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
