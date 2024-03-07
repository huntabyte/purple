import { relations, sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { generateId } from 'lucia';

const timestamps = {
	createdAt: text('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
};

export const users = sqliteTable('user', {
	id: text('id').notNull().primaryKey(),
	username: text('username').notNull().unique(),
	hashed_password: text('hashed_password').notNull(),
	...timestamps
});

export const sessions = sqliteTable('session', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: integer('expires_at').notNull()
});

export const posts = sqliteTable('post', {
	id: text('id')
		.notNull()
		.primaryKey()
		.$defaultFn(() => generateId(15)),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	title: text('title').notNull(),
	content: text('content').notNull(),
	...timestamps
});

export const usersRelations = relations(users, ({ many }) => ({
	posts: many(posts)
}));

export const postsRelations = relations(posts, ({ one }) => ({
	user: one(users, {
		fields: [posts.userId],
		references: [users.id]
	})
}));
