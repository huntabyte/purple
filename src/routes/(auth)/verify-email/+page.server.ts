import { lucia } from "$lib/server/auth.js";
import { verifyEmailToken } from "$lib/server/email-verification.js";
import { verifyEmailTokenSchema } from "$lib/zod-schemas.js";
import { fail, redirect } from "@sveltejs/kit";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

export const load = async () => {
	const form = await superValidate(zod(verifyEmailTokenSchema));

	return {
		form,
	};
};

export const actions = {
	default: async (event) => {
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
};
