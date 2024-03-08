import { faker } from "@faker-js/faker";
import { generateId } from "lucia";
import { Argon2id } from "oslo/password";
import { db } from "../src/lib/server/db.js";
import { posts, users } from "../src/lib/server/schemas.js";

import { webcrypto } from "node:crypto";

globalThis.crypto = webcrypto as Crypto;

async function createUsers() {
	for (let i = 0; i < 10; i++) {
		const userId = generateId(15);
		const hashedPassword = await new Argon2id().hash("1234");

		db.insert(users)
			.values({ username: faker.internet.userName(), hashed_password: hashedPassword, id: userId })
			.returning({ insertedId: users.id })
			.get();
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
