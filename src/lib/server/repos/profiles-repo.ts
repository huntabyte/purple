import { eq } from "drizzle-orm";
import { type Database, db } from "../database/db";
import { type InsertProfile, profilesTable } from "../database/tables";

type CreateProfileProps = {
	userId: string;
};

export class ProfilesRepo {
	constructor(private readonly db: Database) {}

	async getByUserId(userId: string, tx = this.db) {
		return await tx.select().from(profilesTable).where(eq(profilesTable.userId, userId)).get();
	}

	async create(props: CreateProfileProps, tx = this.db) {
		return await tx.insert(profilesTable).values(props).returning().get();
	}

	async update(props: InsertProfile, tx = this.db) {
		return await tx
			.update(profilesTable)
			.set(props)
			.where(eq(profilesTable.userId, props.userId))
			.returning()
			.get();
	}
}

export const profilesRepo = new ProfilesRepo(db);
