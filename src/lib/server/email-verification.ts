import { TimeSpan, createDate, isWithinExpirationDate } from "oslo";
import { alphabet, generateRandomString } from "oslo/crypto";
import { eq } from "drizzle-orm";
import type { User } from "lucia";
import { sendEmail } from "./email";
import { db } from "./database/db";
import { emailVerificationTokensTable, usersTable } from "./database/tables";
import { emailVerificationTokensRepo } from "./repos/email-verification-tokens-repo";
import { handleException } from "$lib/errors";

export async function sendVerificationEmail(email: string, userId: string) {
	/**
	 * Before sending a new email verification token, delete any existing tokens for
	 * the email the user is trying to verify.
	 */
	await emailVerificationTokensRepo.deleteAllByUserId(userId);
	const expiresAt = createDate(new TimeSpan(8, "h")).getTime();
	const token = generateRandomString(6, alphabet("a-z", "0-9"));
	try {
		const { dbToken } = await db
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
	} catch (err) {
		throw handleException(err);
	}
}

type VerifyEmailTokenParams = {
	user: User;
	email: string;
	token: string;
};

export async function verifyEmailToken({ user, email, token }: VerifyEmailTokenParams) {
	const record = await emailVerificationTokensRepo.getByUserId(user.id);

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
		db.update(usersTable).set({ emailVerified: true, email }).where(eq(usersTable.id, user.id)),
	]);

	return {
		...returnObj,
		verified: true,
	};
}
