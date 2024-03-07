import { registerSchema } from '$lib/schemas';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { db, users } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';
import { lucia } from '$lib/server/auth';

export const load: PageServerLoad = async () => {
	return {
		registerForm: await superValidate(zod(registerSchema)),
		loginForm: await superValidate(zod(registerSchema))
	};
};

export const actions: Actions = {
	register: async (event) => {
		try {
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

			return { form };
		} catch (e) {
			return error(500, 'Something went wrong');
		}
	},
	login: async (event) => {
		const form = await superValidate(event, zod(registerSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		return { form };
	}
};
