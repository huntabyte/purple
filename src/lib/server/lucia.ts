import { Lucia } from "lucia";
import { adapter } from "./database/db.js";
import type { User } from "./database/tables.js";
import { dev } from "$app/environment";

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			// set to `true` when using HTTPS
			secure: !dev,
		},
	},
	getUserAttributes: (attributes) => {
		return {
			// attributes has the type of DatabaseUserAttributes
			email: attributes.email,
			emailVerified: attributes.emailVerified,
			createdAt: attributes.createdAt,
			updatedAt: attributes.updatedAt,
			id: attributes.id,
		};
	},
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: User;
	}
}

/**
 * Given a user ID, creates a new session and returns a session cookie to be set in the response.
 */
export async function createSessionCookie(userId: string, sessionId?: string) {
	const session = await lucia.createSession(userId, { sessionId });
	return lucia.createSessionCookie(session.id);
}

/**
 * Given a session ID, invalidates the session and returns a blank session cookie to
 * be set in the response.
 */
export async function invalidateSession(sessionId: string) {
	await lucia.invalidateSession(sessionId);
	return lucia.createBlankSessionCookie();
}
