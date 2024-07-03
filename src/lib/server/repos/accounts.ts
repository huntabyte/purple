import { eq } from "drizzle-orm";
import { accountsTable } from "../database/tables";
import { type Database, db } from "$lib/server/database/db.js";

type CreateAccountProps = {
	userId: string;
	hashedPassword: string;
};

export class AccountsRepo {
	constructor(private readonly db: Database) {}

	create({ userId, hashedPassword }: CreateAccountProps, tx = this.db) {
		return tx.insert(accountsTable).values({ userId, hashedPassword }).returning().get();
	}

	getByUserId(userId: string, tx = this.db) {
		return tx.select().from(accountsTable).where(eq(accountsTable.userId, userId)).get();
	}
}

export const accountsRepo = new AccountsRepo(db);
