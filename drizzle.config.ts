import type { Config } from "drizzle-kit";

export default {
	schema: "./src/lib/server/database/tables.ts",
	out: "./drizzle",
	dialect: "sqlite",
	dbCredentials: {
		url: "./db.sqlite",
	},
} satisfies Config;
