import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { text, integer, sqliteTable, SQLiteAsyncDialect } from "drizzle-orm/sqlite-core";
import { generateId } from "lucia";

const timestamps = {
	createdAt: text("created_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
};

/**
 * The `accounts` table is used to store the user's more sensitive account
 * information, such as their email, phone, address, billing information, etc.
 *
 * We separate this from the `users` table to avoid accidentally leaking sensitive
 * information when querying the `users` table for general user information.
 */
export const accountsTable = sqliteTable("account", {
	id: text("id")
		.notNull()
		.primaryKey()
		.references(() => usersTable.id),
	hashedPassword: text("hashed_password").notNull(),
	...timestamps,
});

export const usersTable = sqliteTable("user", {
	id: text("id").notNull().primaryKey(),
	username: text("username").notNull().unique(),
	...timestamps,
});

/**
 * Sessions are used to store the user's session information.
 */
export const sessionsTable = sqliteTable("session", {
	id: text("id").notNull().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id),
	expiresAt: integer("expires_at").notNull(),
});

export const postsTable = sqliteTable("post", {
	id: text("id")
		.notNull()
		.primaryKey()
		.$defaultFn(() => generateId(15)),
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	content: text("content").notNull(),
	...timestamps,
});

export const commentsTable = sqliteTable("comment", {
	id: text("id")
		.notNull()
		.primaryKey()
		.$defaultFn(() => generateId(15)),
	content: text("content").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" }),
	postId: text("post_id").references(() => postsTable.id, { onDelete: "cascade" }),
	...timestamps,
});

export const likesTable = sqliteTable("like", {
	id: text("id")
		.notNull()
		.primaryKey()
		.$defaultFn(() => generateId(15)),
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" }),
	postId: text("post_id").references(() => postsTable.id, { onDelete: "cascade" }),
	...timestamps,
});

export const usersRelations = relations(usersTable, ({ many }) => ({
	posts: many(postsTable),
	comments: many(commentsTable),
	likes: many(likesTable),
}));

export const postsRelations = relations(postsTable, ({ one, many }) => ({
	user: one(usersTable, {
		fields: [postsTable.userId],
		references: [usersTable.id],
	}),
	comments: many(commentsTable),
	likes: many(likesTable),
}));

export const commentsRelations = relations(commentsTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [commentsTable.userId],
		references: [usersTable.id],
	}),
	post: one(postsTable, {
		fields: [commentsTable.postId],
		references: [postsTable.id],
	}),
}));

export const likesRelations = relations(likesTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [likesTable.userId],
		references: [usersTable.id],
	}),
	post: one(postsTable, {
		fields: [likesTable.postId],
		references: [postsTable.id],
	}),
}));

export type User = InferSelectModel<typeof usersTable>;
export type Like = InferSelectModel<typeof likesTable>;
export type Post = InferSelectModel<typeof postsTable>;
export type Comment = InferSelectModel<typeof commentsTable>;

export type UserWithPosts = User & {
	posts: Post[];
};

export type PostWithUser = Post & {
	user: User;
};

export type PostWithUserAndComments = PostWithUser & {
	comments: Comment[];
};

export type CommentWithUser = Comment & {
	user: User;
};
export type LikeWithUser = Like & {
	user: User;
};

export type PostWithRelations = Post & {
	user: User;
	comments: CommentWithUser[];
	likes: LikeWithUser[];
};

export const sqliteDialect = new SQLiteAsyncDialect();
