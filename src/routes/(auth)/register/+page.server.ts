import { fail, redirect } from "@sveltejs/kit";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { registerSchema } from "./schemas";
import { handleException } from "$lib/errors";
import { authService } from "$lib/server/services/auth-service";

export async function load(event) {
	if (event.locals.user) redirect(302, "/");
	return {
		form: await superValidate(zod(registerSchema)),
	};
}

export const actions = {
	default: async (event) => {
		if (event.locals.user) redirect(302, "/");
		const form = await superValidate(event, zod(registerSchema));

		if (!form.valid) {
			return fail(400, {
				form,
			});
		}

		try {
			const sessionCookie = await authService.register(form.data);
			event.locals.setSessionCookie(sessionCookie);
			redirect(302, "/verify-email");
		} catch (err) {
			const e = handleException(err);
			if (e.code === "USER_ALREADY_EXISTS") {
				return setError(form, "email", e.message);
			}
			return message(form, e.message, { status: e.status });
		}
	},
};
