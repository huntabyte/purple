import { loginSchema } from '$lib/zod-schemas';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { db, users } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';
import { lucia } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) redirect(302, '/');
	return {
		form: await superValidate(zod(loginSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(loginSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const existingUser = db
			.select()
			.from(users)
			.where(eq(users.username, form.data.username))
			.get();

		if (!existingUser) {
			return setError(form, '', 'Invalid username or password.');
		}

		const validPassword = await new Argon2id().verify(
			existingUser.hashed_password,
			form.data.password
		);
		if (!validPassword) {
			return setError(form, '', 'Invalid username or password.');
		}

		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
