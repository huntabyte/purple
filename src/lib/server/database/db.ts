import { drizzle } from "drizzle-orm/libsql";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { createClient } from "@libsql/client";
import * as schema from "./tables";

const client = createClient({
	url: "file:db.sqlite",
});

export const db = drizzle(client, { schema });

export type Database = typeof db;

export const adapter = new DrizzleSQLiteAdapter(db, schema.sessionsTable, schema.usersTable);
