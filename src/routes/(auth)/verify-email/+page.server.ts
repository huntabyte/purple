import { fail, redirect } from "@sveltejs/kit";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { lucia } from "$lib/server/auth.js";
import { sendVerificationEmail, verifyEmailToken } from "$lib/server/email-verification.js";
import { newEmailVerificationTokenSchema, verifyEmailTokenSchema } from "$lib/zod-schemas.js";

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
		if (!form.valid) {
			return fail(400, { form });
		}

		const { expired, invalid } = await verifyEmailToken({
			user: event.locals.user,
			token: form.data.token,
			email: event.locals.user.email,
		});

		if (expired) {
			setError(form, "token", "Token has expired. Please request a new one.");
			return message(form, "EXPIRED", {
				status: 400,
			});
		} else if (invalid) {
			setError(form, "token", "Invalid token.");
			return message(form, "INVALID", {
				status: 400,
			});
		}

		await lucia.invalidateUserSessions(event.locals.session.userId);
		await event.locals.createSession(event.locals.user.id);

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
