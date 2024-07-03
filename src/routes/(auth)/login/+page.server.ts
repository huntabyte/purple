import { fail, redirect } from "@sveltejs/kit";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { Actions } from "./$types";
import { loginSchema } from "./schemas";
import { handleException } from "$lib/errors";
import { authService } from "$lib/server/services/auth-service";

export async function load(event) {
	if (event.locals.user) redirect(302, "/");

	return {
		form: await superValidate(zod(loginSchema)),
	};
}

export const actions: Actions = {
	default: async (event) => {
		if (event.locals.user) redirect(302, "/");
		const form = await superValidate(event, zod(loginSchema));

		if (!form.valid) {
			return fail(400, {
				form,
			});
		}

		try {
			const sessionCookie = await authService.login(form.data);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: ".",
				...sessionCookie.attributes,
			});
		} catch (err) {
			const e = handleException(err);
			if (e.code === "INVALID_CREDENTIALS") {
				return setError(form, "password", e.message);
			}
			return message(form, e.message, { status: e.status });
		}

		redirect(302, "/");
	},
};
