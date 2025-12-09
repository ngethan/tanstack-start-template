import { env } from "@/env";
import type { auth } from "@/lib/auth";
import {
	anonymousClient,
	inferOrgAdditionalFields,
	oneTapClient,
	organizationClient,
	phoneNumberClient,
	twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getBaseURL } from "../utils";
import { ac, admin, member, owner } from "./permissions";

export const authClient = createAuthClient({
	baseURL: getBaseURL(),
	plugins: [
		anonymousClient(),
		organizationClient({
			schema: inferOrgAdditionalFields<typeof auth>(),
			ac,
			roles: { member, admin, owner },
		}),
		phoneNumberClient(),
		twoFactorClient(),
		oneTapClient({
			clientId: env.VITE_GOOGLE_CLIENT_ID,
			// Optional client configuration:
			autoSelect: false,
			cancelOnTapOutside: true,
			context: "signin",
			additionalOptions: {
				// Any extra options for the Google initialize method
			},
			// Configure prompt behavior and exponential backoff:
			promptOptions: {
				baseDelay: 1000, // Base delay in ms (default: 1000)
				maxAttempts: 5, // Maximum number of attempts before triggering onPromptNotification (default: 5)
			},
		}),
	],
});
