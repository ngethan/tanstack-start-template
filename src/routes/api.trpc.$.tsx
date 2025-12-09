import { createContext } from "@/integrations/trpc/init";
import { trpcRouter } from "@/integrations/trpc/root";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

function handler({ request }: { request: Request }) {
	return fetchRequestHandler({
		req: request,
		router: trpcRouter,
		endpoint: "/api/trpc",
		createContext: async () => {
			return createContext({
				headers: request.headers,
			});
		},
	});
}

export const ServerRoute = createServerFileRoute("/api/trpc/$").methods({
	GET: handler,
	POST: handler,
});
