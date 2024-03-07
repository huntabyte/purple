import type { Config } from 'drizzle-kit';

export default {
	schema: './src/lib/server/db.ts',
	out: './drizzle',
	driver: 'better-sqlite',
	dbCredentials: {
		url: './db.sqlite'
	}
} satisfies Config;
