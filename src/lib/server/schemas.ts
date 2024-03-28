import { relations, SQL, sql, type InferSelectModel } from "drizzle-orm";
import {
	text,
	integer,
	sqliteTable,
	SQLiteAsyncDialect,
	SQLiteColumn,
} from "drizzle-orm/sqlite-core";
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
export const accounts = sqliteTable("account", {
	id: text("id")
		.notNull()
		.primaryKey()
		.references(() => users.id),
	hashedPassword: text("hashed_password").notNull(),
	...timestamps,
});

export const users = sqliteTable("user", {
	id: text("id").notNull().primaryKey(),
	username: text("username").notNull().unique(),
	...timestamps,
});

/**
 * Sessions are used to store the user's session information.
 */
export const sessions = sqliteTable("session", {
	id: text("id").notNull().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id),
	expiresAt: integer("expires_at").notNull(),
});

export const posts = sqliteTable("post", {
	id: text("id")
		.notNull()
		.primaryKey()
		.$defaultFn(() => generateId(15)),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	content: text("content").notNull(),
	...timestamps,
});

export const comments = sqliteTable("comment", {
	id: text("id")
		.notNull()
		.primaryKey()
		.$defaultFn(() => generateId(15)),
	content: text("content").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	postId: text("post_id").references(() => posts.id, { onDelete: "cascade" }),
	...timestamps,
});

export const likes = sqliteTable("like", {
	id: text("id")
		.notNull()
		.primaryKey()
		.$defaultFn(() => generateId(15)),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	postId: text("post_id").references(() => posts.id, { onDelete: "cascade" }),
	...timestamps,
});

export const usersRelations = relations(users, ({ many }) => ({
	posts: many(posts),
	comments: many(comments),
	likes: many(likes),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
	user: one(users, {
		fields: [posts.userId],
		references: [users.id],
	}),
	comments: many(comments),
	likes: many(likes),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
	user: one(users, {
		fields: [comments.userId],
		references: [users.id],
	}),
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id],
	}),
}));

export const likesRelations = relations(likes, ({ one }) => ({
	user: one(users, {
		fields: [likes.userId],
		references: [users.id],
	}),
	post: one(posts, {
		fields: [likes.postId],
		references: [posts.id],
	}),
}));

export type User = InferSelectModel<typeof users>;
export type Like = InferSelectModel<typeof likes>;
export type Post = InferSelectModel<typeof posts>;
export type Comment = InferSelectModel<typeof comments>;

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
/**
 * @example
 * db.query.locations.findFirst({
 *  extras: (fields) => {
 *     return {
 *      ...countRelation("equipmentCount", fields.id, equipmentLocations.locationId),
 *     };
 *   },
 * };
 */
export const countRelation = <const T extends string>(
	name: T,
	fieldId: SQLiteColumn,
	refId: SQLiteColumn,
	refId2: SQLiteColumn,
	id: string
): { [Key in T]: SQL.Aliased<number> } => {
	const sqlChunks = sql`(SELECT COUNT(*) FROM ${refId.table} WHERE ${refId} = ${fieldId} AND ${refId2} = '${sql.raw(id)}')`;
	const rawSQL = sql.raw(sqliteDialect.sqlToQuery(sqlChunks).sql);

	return {
		[name]: rawSQL.mapWith(Number).as(name),
	} as { [Key in T]: SQL.Aliased<number> };
};
