import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { auth } from "./index";

export const getSession = createServerFn({ method: "GET" }).handler(
	async () => {
		const request = getWebRequest();

		if (!request) {
			return null;
		}

		const session = await auth.api.getSession({
			headers: request.headers,
		});

		return session || null;
	},
);

export const requireAuth = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();

		if (!session?.user) {
			throw redirect({
				to: "/login",
			});
		}

		return session;
	},
);

export const redirectIfAuthenticated = createServerFn({
	method: "GET",
}).handler(async () => {
	const session = await getSession();

	if (session?.user) {
		throw redirect({
			to: "/dashboard",
		});
	}

	return null;
});
