import { eq } from "drizzle-orm";
import { type Database, db } from "../database/db";
import { profilesTable } from "../database/tables";

type CreateProfileProps = {
	userId: string;
};

export class ProfilesRepo {
	constructor(private readonly db: Database) {}

	getByUserId(userId: string, tx = this.db) {
		return tx.select().from(profilesTable).where(eq(profilesTable.userId, userId)).get();
	}

	create(props: CreateProfileProps, tx = this.db) {
		return tx.insert(profilesTable).values(props).returning().get();
	}
}

export const profilesRepo = new ProfilesRepo(db);
