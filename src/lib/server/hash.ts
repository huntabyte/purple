import { Argon2id } from "oslo/password";

export async function hashPassword(password: string) {
	return await new Argon2id().hash(password);
}

export async function verifyPassword(hashedPassword: string, password: string) {
	return await new Argon2id().verify(hashedPassword, password);
}
