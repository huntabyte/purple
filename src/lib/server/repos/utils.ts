import { db } from "../database/db";

export async function createTransaction<T extends typeof db>(cb: (tx: T) => Promise<void>) {
	// eslint-disable-next-line ts/no-explicit-any
	await db.transaction(cb as any);
}
