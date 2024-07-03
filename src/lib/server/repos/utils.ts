import { db } from "../database/db";

export async function createTransaction<T extends typeof db>(cb: Parameters<T["transaction"]>[0]) {
	await db.transaction(cb);
}
