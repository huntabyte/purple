import { type Actions, error, redirect } from "@sveltejs/kit";
import { fail, message, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import {
	cancelEmailChangeRequestSchema,
	updateEmailSchema,
	updateProfileSchema,
	verifyEmailChangeSchema,
} from "./schemas.js";
import { usersService } from "$lib/server/services/users-service.js";
import { handleException } from "$lib/errors.js";
import { createMessage } from "$lib/helpers.js";
import { authService } from "$lib/server/services/auth-service.js";
import { ERROR_MESSAGES } from "$lib/server/constants.js";

export async function load(event) {
	if (!event.locals.session) redirect(302, "/login");

	const [profile, pendingEmailChangeVerification] = await Promise.all([
		usersService.getProfileByUserId(event.locals.session.userId),
		authService.getEmailChangeRequestStatus(event.locals.session.userId),
	]);

	const [updateProfileForm, updateEmailForm, verifyEmailChangeForm, cancelEmailChangeForm] =
		await Promise.all([
			superValidate(profile, zod(updateProfileSchema)),
			superValidate(zod(updateEmailSchema)),
			superValidate(zod(verifyEmailChangeSchema)),
			superValidate(zod(cancelEmailChangeRequestSchema)),
		]);

	return {
		pendingEmailChangeVerification,
		updateProfileForm,
		updateEmailForm,
		verifyEmailChangeForm,
		cancelEmailChangeForm,
	};
}

export const actions: Actions = {
	updateProfile: async (event) => {
		if (!event.locals.session) redirect(302, "/login");
		const form = await superValidate(event, zod(updateProfileSchema));
		if (!form.valid) {
			return fail(400, { form });
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

		return message(form, createMessage({ type: "success", text: "Profile updated successfully!" }));
	},
	updateEmail: async (event) => {
		if (!event.locals.session) redirect(302, "/login");
		const form = await superValidate(event, zod(updateEmailSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await authService.requestEmailChange({
				newEmail: form.data.email,
				password: form.data.password,
				userId: event.locals.session.userId,
			});
		} catch (err) {
			const e = handleException(err);
			if (e.code === "INVALID_CREDENTIALS") {
				return setError(form, "password", "Invalid credentials.");
			}
			if (e.code === "USER_ALREADY_EXISTS") {
				return setError(form, "email", "Email already in use.");
			}
			return message(form, createMessage({ code: e.code, text: e.message, type: "error" }), {
				status: e.status,
			});
		}

		return message(
			form,
			createMessage({
				type: "success",
				text: "A verification email has been sent to your new email address.",
			})
		);
	},
	verifyEmailChange: async (event) => {
		if (!event.locals.session || !event.locals.user) error(401, ERROR_MESSAGES.UNAUTHORIZED);
		const form = await superValidate(event, zod(verifyEmailChangeSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const sessionCookie = await authService.verifyChangeEmailToken({
				user: event.locals.user,
				token: form.data.token,
			});
			event.locals.setSessionCookie(sessionCookie);
		} catch (err) {
			const e = handleException(err);
			if (e.code === "TOKEN_EXPIRED") {
				return message(
					form,
					createMessage({
						code: "TOKEN_EXPIRED",
						text: ERROR_MESSAGES.TOKEN_EXPIRED,
						type: "error",
					}),
					{ status: 400 }
				);
			} else if (e.code === "TOKEN_INVALID") {
				return message(
					form,
					createMessage({
						code: "TOKEN_INVALID",
						text: ERROR_MESSAGES.TOKEN_INVALID,
						type: "error",
					})
				);
			}
			return message(form, createMessage({ code: e.code, text: e.message, type: "error" }), {
				status: e.status,
			});
		}

		return message(form, createMessage({ type: "success", text: "Email updated successfully!" }));
	},
	cancelEmailChangeRequest: async (event) => {
		if (!event.locals.session) error(401, ERROR_MESSAGES.UNAUTHORIZED);
		const form = await superValidate(event.url, zod(cancelEmailChangeRequestSchema));
		if (!form.valid) return fail(400, { form });
		if (form.data.userId !== event.locals.session.userId) error(401, ERROR_MESSAGES.UNAUTHORIZED);

		try {
			await authService.cancelEmailChangeRequest(event.locals.session.userId);
		} catch (err) {
			const e = handleException(err);
			return message(form, createMessage({ code: e.code, text: e.message, type: "error" }), {
				status: e.status,
			});
		}

		return message(
			form,
			createMessage({ type: "success", text: "Email change request cancelled!" })
		);
	},
};
