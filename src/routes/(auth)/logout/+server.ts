import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { authService } from "$lib/server/services/auth-service";

export const POST: RequestHandler = async (event) => {
	if (!event.locals.session) redirect(302, "/");
	const sessionCookie = await authService.logout(event.locals.session.userId);
	event.locals.setSessionCookie(sessionCookie);
	redirect(302, "/");
};
