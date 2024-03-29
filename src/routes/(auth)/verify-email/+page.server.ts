import { lucia } from "$lib/server/auth.js";
import { verifyEmailToken } from "$lib/server/email-verification.js";
import { verifyEmailTokenSchema } from "$lib/zod-schemas.js";
import { fail, redirect } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
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

		try {
			await verifyEmailToken({
				user: event.locals.user,
				token: form.data.token,
				email: event.locals.user.email,
			});
		} catch {
			return setError(form, "Invalid token.");
		}

		await lucia.invalidateUserSessions(event.locals.session.userId);

		redirect(303, "/");
	},
};
