import { registerSchema } from '$lib/schemas';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { db, users } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';
import { lucia } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) redirect(302, '/');
	return {
		form: await superValidate(zod(registerSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(registerSchema));
		if (!form.valid) {
			console.log('form', form);
			return fail(400, {
				form
			});
		}

		const userExists = db
			.select({ username: users.username })
			.from(users)
			.where(eq(users.username, form.data.username))
			.get();

		if (userExists) {
			return setError(form, 'username', 'Username already exists.');
		}

		const userId = generateId(15);
		const hashedPassword = await new Argon2id().hash(form.data.password);

		const { insertedId } = db
			.insert(users)
			.values({ username: form.data.username, hashed_password: hashedPassword, id: userId })
			.returning({ insertedId: users.id })
			.get();

		const session = await lucia.createSession(insertedId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/login');
	}
};
