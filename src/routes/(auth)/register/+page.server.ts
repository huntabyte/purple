import { registerSchema } from "$lib/zod-schemas";
import { fail, redirect } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { users, accounts } from "$lib/server/schemas.js";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { Argon2id } from "oslo/password";
import { lucia } from "$lib/server/auth";
import { db } from "$lib/server/db";

export const load = async (event) => {
	if (event.locals.user) redirect(302, "/");
	return {
		form: await superValidate(zod(registerSchema)),
	};
};

export const actions = {
	default: async (event) => {
		if (event.locals.user) redirect(302, "/");
		const form = await superValidate(event, zod(registerSchema));
		if (!form.valid) {
			console.log("form", form);
			return fail(400, {
				form,
			});
		}

		const userExists = db
			.select({ username: users.username })
			.from(users)
			.where(eq(users.username, form.data.username))
			.get();

		if (userExists) {
			return setError(form, "username", "Username already exists.");
		}

		const userId = generateId(15);
		const hashedPassword = await new Argon2id().hash(form.data.password);

		const { id } = db
			.insert(users)
			.values({ username: form.data.username, id: userId })
			.returning({ id: users.id })
			.get();

		db.insert(accounts).values({
			id,
			hashedPassword,
		});

		const session = await lucia.createSession(id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes,
		});

		redirect(302, "/login");
	},
};
