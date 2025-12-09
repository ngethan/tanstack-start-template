import { env } from "@/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as authSchema from "./schema/auth";
import * as shortcutsSchema from "./schema/shortcuts";

export const client = postgres(env.DATABASE_URL, {
	prepare: false,
	max: 1, // Start with 1 connection, increase cautiously if needed
	idle_timeout: 20, // Close idle connections after 20 seconds
	connect_timeout: 10, // Timeout connection attempts after 10 seconds
});

export const db = drizzle(client, {
	schema: {
		...authSchema,
		...shortcutsSchema,
	},
});
