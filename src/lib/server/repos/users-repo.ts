import { eq } from "drizzle-orm";
import { usersTable } from "../database/tables";
import { type Database, db } from "$lib/server/database/db.js";

type UpdateEmailVerificationStatusProps = {
	userId: string;
	emailVerified: boolean;
	email: string;
};

export class UsersRepo {
	constructor(private readonly db: Database) {}

	async create(email: string, tx = this.db) {
		return await tx.insert(usersTable).values({ email }).returning().get();
	}

	async getByEmail(email: string, tx = this.db) {
		return await tx.select().from(usersTable).where(eq(usersTable.email, email)).get();
	}

	async updateEmailVerificationStatus(props: UpdateEmailVerificationStatusProps, tx = this.db) {
		return await tx
			.update(usersTable)
			.set(props)
			.where(eq(usersTable.id, props.userId))
			.returning()
			.get();
	}
}

export const usersRepo = new UsersRepo(db);
