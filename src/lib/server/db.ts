import { drizzle } from "drizzle-orm/better-sqlite3";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import SQLite from "better-sqlite3";
import * as schema from "./schemas";

const sqlite = new SQLite("db.sqlite");

export const db = drizzle(sqlite, { schema });

export type Database = typeof db;

export const adapter = new DrizzleSQLiteAdapter(db, schema.sessionsTable, schema.usersTable);
