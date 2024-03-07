import { drizzle } from 'drizzle-orm/better-sqlite3';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import * as schema from './schemas.js';

import Database from 'better-sqlite3';

const sqlite = new Database('db.sqlite');

export const db = drizzle(sqlite, { schema });

export const adapter = new DrizzleSQLiteAdapter(db, schema.sessions, schema.users);
