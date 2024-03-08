import { faker } from "@faker-js/faker";
import { generateId } from "lucia";
import { Argon2id } from "oslo/password";
import { db } from "../src/lib/server/db.js";
import { posts, accounts, users } from "../src/lib/server/schemas.js";
import { mockUserData } from "./data.js";

import { webcrypto } from "node:crypto";

globalThis.crypto = webcrypto as Crypto;

async function createUsers() {
	for (const user of mockUserData) {
		const userId = generateId(15);
		const hashedPassword = await new Argon2id().hash("1234");

		const { id } = db
			.insert(users)
			.values({ username: user.username, id: userId })
			.returning({ id: users.id })
			.get();

		await db.insert(accounts).values({
			hashedPassword,
			id,
		});

		createPosts(userId);
	}
}

async function createPosts(userId: string) {
	for (let i = 0; i < 5; i++) {
		await db.insert(posts).values({
			title: faker.word.words(3),
			content: faker.company.catchPhrase(),
			userId,
		});
	}
}

async function seed() {
	await createUsers();
}

await seed();
