import { error, fail, redirect } from "@sveltejs/kit";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { sendVerificationEmail } from "$lib/server/email-verification.js";
import { newEmailVerificationTokenSchema, verifyEmailTokenSchema } from "$lib/zod-schemas.js";
import { isCustomError } from "$lib/errors.js";
import { authService } from "$lib/server/services/auth-service.js";

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
				if (err.code === "TOKEN_EXPIRED") {
					setError(form, "token", "Token has expired. Please request a new one.");
					return message(form, "EXPIRED", {
						status: err.status,
					});
				}
				if (err.code === "TOKEN_INVALID") {
					setError(form, "token", "Invalid token.");
					return message(form, "INVALID", {
						status: 400,
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
			await sendVerificationEmail(event.locals.user.email, event.locals.user.id);
		} catch {
			return fail(500, { form });
		}

		return { form };
	},
};
