import { eq } from "drizzle-orm";
import { type Database, db } from "../database/db";
import { emailChangeTokensTable, emailVerifyTokensTable } from "../database/tables";
import { generateTokenWithExpiration } from "../tokens";

export type CreateEmailTokenProps = {
	userId: string;
	email: string;
	expiresAt: number;
	token: string;
};

type TokenTable = typeof emailChangeTokensTable | typeof emailVerifyTokensTable;

export class EmailTokenRepo {
	constructor(
		readonly db: Database,
		readonly table: TokenTable
	) {}

	async getByUserId(userId: string, tx = this.db) {
		return await tx.select().from(this.table).where(eq(this.table.userId, userId)).get();
	}

	async deleteByUserId(userId: string, tx = this.db) {
		await tx.delete(this.table).where(eq(this.table.userId, userId));
	}

	async create(props: CreateEmailTokenProps, tx = this.db) {
		const { expiresAt, token } = generateTokenWithExpiration();
		return await tx
			.insert(this.table)
			.values({
				...props,
				expiresAt,
				token,
			})
			.returning()
			.get();
	}
}

export const emailVerifyTokensRepo = new EmailTokenRepo(db, emailVerifyTokensTable);
export const emailChangeTokensRepo = new EmailTokenRepo(db, emailChangeTokensTable);
