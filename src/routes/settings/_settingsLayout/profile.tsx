import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/integrations/trpc/react";
import { requireAuth } from "@/lib/auth/server";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings/_settingsLayout/profile")({
	loader: async () => {
		const user = await requireAuth();
		return { user };
	},
	component: ProfileSettings,
});

function ProfileSettings() {
	const data = Route.useLoaderData();
	const user = data.user.user;
	const router = useRouter();
	const trpc = useTRPC();

	const nameParts = user.name?.split(" ") || [];
	const initialFirstName = nameParts[0] || "";
	const initialLastName = nameParts.slice(1).join(" ") || "";

	const [firstName, setFirstName] = useState(initialFirstName);
	const [lastName, setLastName] = useState(initialLastName);
	const [bio, setBio] = useState("");

	const updateProfileMutation = useMutation(
		trpc.user.updateProfile.mutationOptions({
			onSuccess: () => {
				toast.success("Profile updated successfully");
				router.invalidate();
			},
			onError: (error) => {
				toast.error(error.message || "Failed to update profile");
			},
		}),
	);

	const getUserInitials = () => {
		if (!user.name) return "U";
		const parts = user.name.split(" ");
		if (parts.length > 1) {
			return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
		}
		return user.name.slice(0, 2).toUpperCase();
	};

	const handleSave = async () => {
		updateProfileMutation.mutate({
			firstName,
			lastName,
			bio,
		});
	};

	return (
		<div className="rounded-lg border bg-card">
			<div className="p-6">
				<div>
					<h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
					<p className="text-muted-foreground">
						Manage your personal information and public profile
					</p>
				</div>

				<Separator className="my-6" />

				<div className="space-y-6">
					<div>
						<Label className="text-base">Profile Picture</Label>
						<div className="mt-2 flex items-center gap-4">
							<Avatar className="h-20 w-20">
								{user.image ? (
									<img
										src={user.image}
										alt={user.name}
										className="aspect-square h-full w-full rounded-full object-cover"
									/>
								) : (
									<AvatarFallback className="text-lg">
										{getUserInitials()}
									</AvatarFallback>
								)}
							</Avatar>
							<div>
								<Button variant="outline" size="sm">
									Upload Image
								</Button>
								<p className="mt-1 text-xs text-muted-foreground">
									JPG, PNG or GIF, max 2MB
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="firstName">First Name</Label>
								<Input
									id="firstName"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									placeholder="John"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName">Last Name</Label>
								<Input
									id="lastName"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									placeholder="Doe"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" value={user.email} disabled />
							<p className="text-xs text-muted-foreground">
								Contact support to change your email address
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="bio">Bio</Label>
							<Textarea
								id="bio"
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								placeholder="Tell us about yourself..."
							/>
						</div>
					</div>
				</div>

				<Separator className="my-6" />

				<Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
					{updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
				</Button>
			</div>
		</div>
	);
}
