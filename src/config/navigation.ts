import {
	FileText,
	Home,
	LayoutGrid,
	type LucideIcon,
	PlusCircle,
	Settings,
	Users,
} from "lucide-react";

export interface NavigationItem {
	title: string;
	icon: LucideIcon;
	href: string;
	description: string;
	badge?: string;
	isExternal?: boolean;
}

export const mainNavigation: NavigationItem[] = [
	{
		title: "Home",
		icon: Home,
		href: "/dashboard",
		description: "Dashboard overview",
	},
	{
		title: "Posts",
		icon: FileText,
		href: "/dashboard/posts",
		description: "View all posts",
	},
	{
		title: "Create Post",
		icon: PlusCircle,
		href: "/dashboard/posts/new",
		description: "Create a new post",
	},
	{
		title: "Examples",
		icon: LayoutGrid,
		href: "/dashboard/examples",
		description: "Component examples",
	},
	{
		title: "Settings",
		icon: Settings,
		href: "/settings",
		description: "Account settings",
	},
];

// Admin-only navigation items
export const adminNavigation: NavigationItem[] = [
	{
		title: "Manage Users",
		icon: Users,
		href: "/dashboard/admin/users",
		description: "Manage user accounts",
	},
];

export interface CommandAction {
	title: string;
	icon: LucideIcon;
	action?: () => void;
	href?: string;
}

export const commandActions: CommandAction[] = [
	{
		title: "Go to Dashboard",
		icon: Home,
		href: "/dashboard",
	},
	{
		title: "View Posts",
		icon: FileText,
		href: "/dashboard/posts",
	},
	{
		title: "Create Post",
		icon: PlusCircle,
		href: "/dashboard/posts/new",
	},
];
