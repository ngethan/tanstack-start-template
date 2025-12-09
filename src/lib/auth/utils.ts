import { authClient } from "@/lib/auth/client";
import type { Account } from "better-auth";
import { toast } from "sonner";

/**
 * Fetch all linked accounts for the current user
 */
export async function fetchUserAccounts() {
	try {
		const { data, error } = await authClient.listAccounts();
		if (error) {
			console.error("Error fetching accounts:", error);
			toast.error("Failed to load linked accounts");
			return { accounts: [], hasPasswordAccount: false };
		}
		if (data) {
			const hasPassword = data.some(
				(account) => account.providerId === "credential",
			);
			return { accounts: data, hasPasswordAccount: hasPassword };
		}
		return { accounts: [], hasPasswordAccount: false };
	} catch (err) {
		console.error("Failed to fetch accounts:", err);
		return { accounts: [], hasPasswordAccount: false };
	}
}

/**
 * Check if user has a password-based account
 */
export function hasPasswordAccount(accounts: Omit<Account, "userId">[]) {
	return accounts.some((account) => account.providerId === "credential");
}

/**
 * Update user's email address
 */
export async function updateEmail(newEmail: string, currentEmail?: string) {
	if (!newEmail || newEmail === currentEmail) {
		toast.error("Please enter a different email address");
		return { success: false, error: "Invalid email" };
	}

	try {
		const { error } = await authClient.changeEmail({ newEmail });

		if (error) {
			toast.error(error.message || "Failed to update email");
			return { success: false, error: error.message };
		}

		toast.success(
			"Email update request sent. Please check your new email for verification.",
		);
		return { success: true };
	} catch (err) {
		console.error("Update email error:", err);
		toast.error("An unexpected error occurred");
		return { success: false, error: err };
	}
}

/**
 * Get provider display name
 */
export function getProviderName(provider: string) {
	switch (provider) {
		case "github":
			return "GitHub";
		case "google":
			return "Google";
		case "microsoft":
			return "Microsoft";
		case "credential":
			return "Email & Password";
		default:
			return provider.charAt(0).toUpperCase() + provider.slice(1);
	}
}
