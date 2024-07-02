import { type InferSelectModel, sql } from "drizzle-orm";
import { SQLiteAsyncDialect, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateId } from "lucia";

const timestamps = {
	createdAt: text("created_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
};

export const usersTable = sqliteTable("user", {
	id: text("id").notNull().primaryKey(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
	...timestamps,
});

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

export const emailVerificationTokensTable = sqliteTable("email_verification_token", {
	id: text("id")
		.notNull()
		.$defaultFn(() => generateId(15)),
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id)
		.unique(),
	email: text("email").notNull(),
	token: text("token").notNull(),
	expiresAt: integer("expires_at").notNull(),
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

export type User = InferSelectModel<typeof usersTable>;

export type CommentWithUser = Comment & {
	user: User;
};

export const sqliteDialect = new SQLiteAsyncDialect();
