import { useEffect, useState } from "react";

export interface Notification {
	id: number;
	message: string;
	time: string;
	unread: boolean;
	type?: "info" | "success" | "warning" | "error";
}

export function useNotifications() {
	// In a real app, this would fetch from an API
	const [notifications, setNotifications] = useState<Notification[]>([
		{
			id: 1,
			message: "5 new candidates matched for Senior Developer role",
			time: "2m ago",
			unread: true,
			type: "info",
		},
		{
			id: 2,
			message: "Interview scheduled with John Doe",
			time: "1h ago",
			unread: true,
			type: "success",
		},
		{
			id: 3,
			message: "Fast-track candidate accepted offer",
			time: "3h ago",
			unread: false,
			type: "success",
		},
	]);

	const unreadCount = notifications.filter((n) => n.unread).length;

	const markAsRead = (id: number) => {
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
		);
	};

	const markAllAsRead = () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
	};

	const dismissNotification = (id: number) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	// Simulate real-time notifications
	useEffect(() => {
		const interval = setInterval(() => {
			// Random chance of new notification
			if (Math.random() > 0.95) {
				const newNotification: Notification = {
					id: Date.now(),
					message: `New notification at ${new Date().toLocaleTimeString()}`,
					time: "just now",
					unread: true,
					type: "info",
				};
				setNotifications((prev) => [newNotification, ...prev].slice(0, 10));
			}
		}, 30000); // Check every 30 seconds

		return () => clearInterval(interval);
	}, []);

	return {
		notifications,
		unreadCount,
		markAsRead,
		markAllAsRead,
		dismissNotification,
	};
}
