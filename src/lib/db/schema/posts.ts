import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const posts = pgTable("posts", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	content: text("content").notNull(),
	imageUrl: text("image_url"),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const postComments = pgTable("post_comments", {
	id: text("id").primaryKey(),
	postId: text("post_id")
		.notNull()
		.references(() => posts.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	content: text("content").notNull(),
	imageUrl: text("image_url"),
	gifUrl: text("gif_url"),
	parentId: text("parent_id"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	deletedAt: timestamp("deleted_at"),
});

export const commentLikes = pgTable("comment_likes", {
	id: text("id").primaryKey(),
	commentId: text("comment_id")
		.notNull()
		.references(() => postComments.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
