import { eq } from "drizzle-orm";
import { emailVerificationTokensTable } from "../database/tables";
import { generateTokenWithExpiration } from "../tokens";
import { type Database, db } from "$lib/server/database/db.js";

type CreateEmailVerificationTokenProps = {
	userId: string;
	email: string;
};

export class EmailVerificationTokensRepo {
	constructor(private readonly db: Database) {}

	async getByUserId(userId: string, tx = this.db) {
		return await tx
			.select()
			.from(emailVerificationTokensTable)
			.where(eq(emailVerificationTokensTable.userId, userId))
			.get();
	}

	async deleteByUserId(userId: string, tx = this.db) {
		return await tx
			.delete(emailVerificationTokensTable)
			.where(eq(emailVerificationTokensTable.userId, userId));
	}

	async create(props: CreateEmailVerificationTokenProps, tx = this.db) {
		const { expiresAt, token } = generateTokenWithExpiration();
		return await tx
			.insert(emailVerificationTokensTable)
			.values({
				...props,
				expiresAt,
				token,
			})
			.returning()
			.get();
	}
}

export const emailVerificationTokensRepo = new EmailVerificationTokensRepo(db);
