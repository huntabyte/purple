import { error, fail, redirect } from "@sveltejs/kit";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { newEmailVerificationTokenSchema, verifyEmailTokenSchema } from "./schemas.js";
import { isCustomError } from "$lib/errors.js";
import { authService } from "$lib/server/services/auth-service.js";
import { createMessage } from "$lib/helpers.js";

export async function load(event) {
	if (!event.locals.session || !event.locals.user) redirect(303, "/login");
	if (event.locals.user.emailVerified) redirect(303, "/");

	const [verifyForm, newForm] = await Promise.all([
		superValidate(zod(verifyEmailTokenSchema)),
		superValidate(zod(newEmailVerificationTokenSchema)),
	]);
	return {
		verifyForm,
		newForm,
	};
}

export const actions = {
	verifyToken: async (event) => {
		if (!event.locals.session || !event.locals.user) redirect(303, "/login");

		const form = await superValidate(event, zod(verifyEmailTokenSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const sessionCookie = await authService.verifyEmailToken({
				user: event.locals.user,
				token: form.data.token,
				email: event.locals.user.email,
			});
			event.locals.setSessionCookie(sessionCookie);
		} catch (err) {
			if (isCustomError(err)) {
				const msg = createMessage({
					code: err.code,
					type: "error",
					text: err.message,
				});
				if (err.code === "TOKEN_EXPIRED") {
					return message(form, msg, {
						status: err.status,
					});
				}
				if (err.code === "TOKEN_INVALID") {
					setError(form, "token", "Invalid token.");
					return message(form, msg, {
						status: err.status,
					});
				}

				error(err.status, err.message);
			}
		}

		redirect(303, "/");
	},
	newToken: async (event) => {
		if (!event.locals.session || !event.locals.user) redirect(303, "/login");
		const form = await superValidate(event, zod(newEmailVerificationTokenSchema));

		try {
			await authService.sendVerificationEmail({
				email: event.locals.user.email,
				userId: event.locals.user.id,
			});
		} catch (err) {
			if (isCustomError(err)) {
				const msg = createMessage({
					code: err.code,
					type: "error",
					text: err.message,
				});
				return message(form, msg, { status: err.status });
			}
			return fail(500, { form });
		}

		return { form };
	},
};
