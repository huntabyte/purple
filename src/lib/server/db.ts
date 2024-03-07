import { drizzle } from 'drizzle-orm/better-sqlite3';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

import Database from 'better-sqlite3';

const sqlite = new Database('db.sqlite');

export const db = drizzle(sqlite);

export const users = sqliteTable('user', {
	id: text('id').notNull().primaryKey(),
	username: text('username').notNull().unique(),
	hashed_password: text('hashed_password').notNull()
});

export const sessions = sqliteTable('session', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: integer('expires_at').notNull()
});

export const adapter = new DrizzleSQLiteAdapter(db, sessions, users);
