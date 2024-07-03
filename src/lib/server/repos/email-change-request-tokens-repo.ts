import { eq } from "drizzle-orm";
import { emailChangeRequestTokensTable } from "../database/tables";
import { generateTokenWithExpiration } from "../tokens";
import { type Database, db } from "$lib/server/database/db";

type CreateEmailChangeRequestTokenProps = {
	userId: string;
	newEmail: string;
};

export class EmailChangeRequestTokensRepo {
	constructor(private readonly db: Database) {}

	async getByUserId(userId: string, tx = this.db) {
		return await tx
			.select()
			.from(emailChangeRequestTokensTable)
			.where(eq(emailChangeRequestTokensTable.userId, userId))
			.get();
	}

	async deleteByUserId(userId: string, tx = this.db) {
		return await tx
			.delete(emailChangeRequestTokensTable)
			.where(eq(emailChangeRequestTokensTable.userId, userId));
	}

	async create(props: CreateEmailChangeRequestTokenProps, tx = this.db) {
		const { expiresAt, token } = generateTokenWithExpiration();
		return await tx
			.insert(emailChangeRequestTokensTable)
			.values({
				...props,
				expiresAt,
				token,
			})
			.returning()
			.get();
	}
}

export const emailChangeRequestTokensRepo = new EmailChangeRequestTokensRepo(db);
