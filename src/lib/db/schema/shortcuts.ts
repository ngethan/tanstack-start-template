import {
	boolean,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export const userShortcuts = pgTable(
	"user_shortcuts",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		shortcutId: text("shortcut_id").notNull(), // e.g., "toggle-sidebar", "search"
		keys: text("keys").array().notNull(),
		enabled: boolean("enabled").default(true).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("user_shortcut_unique").on(table.userId, table.shortcutId),
	],
);

export type UserShortcut = typeof userShortcuts.$inferSelect;
export type NewUserShortcut = typeof userShortcuts.$inferInsert;
