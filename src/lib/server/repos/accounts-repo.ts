import { eq } from "drizzle-orm";
import { accountsTable } from "../database/tables";
import { type Database, db } from "$lib/server/database/db.js";

type CreateAccountProps = {
	userId: string;
	hashedPassword: string;
};

type UpdatePasswordProps = {
	userId: string;
	hashedPassword: string;
};

export class AccountsRepo {
	constructor(private readonly db: Database) {}

	async create({ userId, hashedPassword }: CreateAccountProps, tx = this.db) {
		return await tx.insert(accountsTable).values({ userId, hashedPassword }).returning().get();
	}

	async getByUserId(userId: string, tx = this.db) {
		return await tx.select().from(accountsTable).where(eq(accountsTable.userId, userId)).get();
	}

	async updatePassword({ userId, hashedPassword }: UpdatePasswordProps, tx = this.db) {
		return await tx
			.update(accountsTable)
			.set({ hashedPassword })
			.where(eq(accountsTable.userId, userId))
			.returning()
			.get();
	}
}

export const accountsRepo = new AccountsRepo(db);
