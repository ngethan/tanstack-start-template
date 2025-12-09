import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateEmail } from "@/lib/auth/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface EmailSettingsProps {
	currentEmail: string;
}

export function EmailSettings({ currentEmail }: EmailSettingsProps) {
	const [newEmail, setNewEmail] = useState("");
	const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

	const handleUpdateEmail = async () => {
		setIsUpdatingEmail(true);
		try {
			const { success } = await updateEmail(newEmail, currentEmail);
			if (success) {
				setNewEmail("");
			}
		} finally {
			setIsUpdatingEmail(false);
		}
	};

	return (
		<Card className="border rounded-xl">
			<CardHeader>
				<CardTitle className="text-base">Your email</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email" className="text-sm text-muted-foreground">
						Email address
					</Label>
					<Input
						id="email"
						type="email"
						placeholder={currentEmail}
						value={newEmail}
						onChange={(e) => setNewEmail(e.target.value)}
						className="max-w-md bg-muted/50"
					/>
				</div>

				<Button
					onClick={handleUpdateEmail}
					disabled={isUpdatingEmail || !newEmail}
					variant="secondary"
				>
					{isUpdatingEmail ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Updating...
						</>
					) : (
						"Update email"
					)}
				</Button>
			</CardContent>
		</Card>
	);
}
