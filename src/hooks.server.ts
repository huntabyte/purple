// src/hooks.server.ts
import type { Handle } from "@sveltejs/kit";
import type { Cookie } from "lucia";
import { authService } from "$lib/server/services/auth-service";

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(authService.sessionCookieName);

	event.locals.setSessionCookie = (sessionCookie: Cookie) => {
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes,
		});
	};

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await authService.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = authService.createSessionCookie(session.id);
		// sveltekit types deviates from the de-facto standard
		// you can use 'as any' too
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes,
		});
	}
	if (!session) {
		const sessionCookie = authService.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes,
		});
	}
	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};
