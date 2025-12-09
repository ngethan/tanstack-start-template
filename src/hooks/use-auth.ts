import { authClient } from "@/lib/auth/client";

export function useAuth() {
	const session = authClient.useSession();

	// Check if the user already has a DiceBear avatar or needs one generated
	const getDiceBearAvatar = (email: string, existingImage?: string) => {
		if (existingImage?.includes("dicebear")) {
			return existingImage;
		}
		return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email || "default")}`;
	};

	const user = session.data?.user
		? {
				...session.data.user,
				avatar: getDiceBearAvatar(
					session.data.user.email || "",
					session.data.user.image || undefined,
				),
				initials: getInitials(
					session.data.user.name || session.data.user.email || "",
				),
			}
		: null;

	return {
		user,
		session: session.data,
		isLoading: session.isPending,
		error: session.error,
		isAuthenticated: !!session.data?.user,
	};
}

function getInitials(name: string): string {
	const parts = name.split(/[\s@._-]+/).filter(Boolean);
	if (parts.length === 0) return "U";
	if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
	return (parts[0][0] + parts[1][0]).toUpperCase();
}
