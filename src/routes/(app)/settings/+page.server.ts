import { type Actions, redirect } from "@sveltejs/kit";
import { fail, message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { updateEmailSchema, updateProfileSchema } from "./schemas.js";
import { usersService } from "$lib/server/services/users-service.js";
import { handleException } from "$lib/errors.js";
import { createMessage } from "$lib/helpers.js";

export async function load(event) {
	if (!event.locals.session) redirect(302, "/login");

	const [profile] = await Promise.all([
		usersService.getProfileByUserId(event.locals.session.userId),
	]);

	const [updateProfileForm, updateEmailForm] = await Promise.all([
		superValidate(profile, zod(updateProfileSchema)),
		superValidate(zod(updateEmailSchema)),
	]);

	return {
		updateProfileForm,
		updateEmailForm,
	};
}

export const actions: Actions = {
	updateProfile: async (event) => {
		if (!event.locals.session) redirect(302, "/login");
		const form = await superValidate(event, zod(updateProfileSchema));
		if (!form.valid) {
			return fail(400, {
				form,
			});
		}

		try {
			await usersService.updateProfile({
				userId: event.locals.session.userId,
				...form.data,
			});
		} catch (err) {
			const e = handleException(err);
			return message(form, createMessage({ code: e.code, text: e.message, type: "error" }), {
				status: e.status,
			});
		}

		return { form };
	},
};
