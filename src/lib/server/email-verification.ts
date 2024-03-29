import { createDate, isWithinExpirationDate, TimeSpan } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";
import { sendEmail } from "./email";
import { db } from "./db";
import { emailVerificationTokensTable, usersTable } from "./schemas";
import { and, eq } from "drizzle-orm";
import type { User } from "lucia";

async function deleteExistingEmailVerificationTokens(userId: string) {
	return await db
		.delete(emailVerificationTokensTable)
		.where(eq(emailVerificationTokensTable.userId, userId));
}

export async function sendVerificationEmail(email: string, userId: string) {
	/**
	 * Before sending a new email verification token, delete any existing tokens for
	 * the email the user is trying to verify.
	 */
	await deleteExistingEmailVerificationTokens(userId);
	const expiresAt = createDate(new TimeSpan(4, "h")).getTime();
	const token = generateRandomString(6, alphabet("a-z", "0-9"));
	try {
		const { dbToken } = db
			.insert(emailVerificationTokensTable)
			.values({
				userId,
				email,
				token,
				expiresAt,
			})
			.returning({ dbToken: emailVerificationTokensTable.token })
			.get();

		await sendEmail({
			to: email,
			subject: "Verify your email",
			text: `Your verification token is: ${dbToken}`,
			html: `Your verification token is: <b>${dbToken}</b>`,
		});
	} catch {
		throw new Error("Failed to send email");
	}
}

type VerifyEmailTokenParams = {
	user: User;
	email: string;
	token: string;
};

export async function verifyEmailToken({ user, email, token }: VerifyEmailTokenParams) {
	const record = db
		.select()
		.from(emailVerificationTokensTable)
		.where(and(eq(emailVerificationTokensTable.userId, user.id)))
		.get();

	const returnObj = {
		expired: false,
		invalid: false,
		verified: false,
	};

	// if no rcord, token is expired, or token doesn't match, throw error
	if (!record || !isWithinExpirationDate(new Date(record.expiresAt))) {
		return {
			...returnObj,
			expired: true,
		};
	}

	if (record.token !== token) {
		return {
			...returnObj,
			invalid: true,
		};
	}

	// otherwise, token was valid, delete it and verify user email

	await Promise.all([
		db.delete(emailVerificationTokensTable).where(eq(emailVerificationTokensTable.userId, user.id)),
		db
			.update(usersTable)
			.set({ emailVerified: true, email: email })
			.where(eq(usersTable.id, user.id)),
	]);

	return {
		...returnObj,
		verified: true,
	};
}
