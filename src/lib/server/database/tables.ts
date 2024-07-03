import { type InferSelectModel, sql } from "drizzle-orm";
import { SQLiteAsyncDialect, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateId } from "lucia";

const defaultTimestamps = {
	createdAt: text("created_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
};

/**
 * The `users` table represents the minimal information needed to identify a user. It also
 * serves as the single source of truth for the user's ID which is used for references in
 * other tables.
 */
export const usersTable = sqliteTable("user", {
	id: text("id")
		.notNull()
		.primaryKey()
		.$defaultFn(() => generateId(15)),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
	...defaultTimestamps,
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
		.$defaultFn(() => generateId(15)),
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" }),
	hashedPassword: text("hashed_password").notNull(),
	...defaultTimestamps,
});

/**
 * The `profiles` table is used to store the user's public profile information.
 */
export const profilesTable = sqliteTable("profile", {
	id: text("id")
		.notNull()
		.primaryKey()
		.$defaultFn(() => generateId(15)),
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" }),
	displayName: text("display_name"),
	bio: text("bio"),
	...defaultTimestamps,
});

export const emailVerificationTokensTable = sqliteTable("email_verification_token", {
	id: text("id")
		.notNull()
		.$defaultFn(() => generateId(15)),
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" })
		.unique(),
	email: text("email").notNull(),
	token: text("token").notNull(),
	expiresAt: integer("expires_at").notNull(),
});

export const emailChangeRequestTokensTable = sqliteTable("email_change_request_token", {
	id: text("id")
		.notNull()
		.$defaultFn(() => generateId(15)),
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" })
		.unique(),
	newEmail: text("new_email").notNull(),
	token: text("token").notNull(),
	expiresAt: integer("expires_at").notNull(),
});

/**
 * The `sessions` table is used to store the user's session information.
 */
export const sessionsTable = sqliteTable("session", {
	id: text("id").notNull().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" }),
	expiresAt: integer("expires_at").notNull(),
});

export type User = typeof usersTable.$inferSelect;
export type InsertProfile = typeof profilesTable.$inferInsert;

export const sqliteDialect = new SQLiteAsyncDialect();
