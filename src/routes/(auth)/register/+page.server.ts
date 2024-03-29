import { registerSchema } from "$lib/zod-schemas";
import { fail, redirect } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { usersTable, accountsTable } from "$lib/server/schemas.js";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { Argon2id } from "oslo/password";
import { lucia } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { sendVerificationEmail } from "$lib/server/email-verification.js";

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
			return fail(400, {
				form,
			});
		}

		const userExists = db
			.select({ email: usersTable.email })
			.from(usersTable)
			.where(eq(usersTable.email, form.data.email))
			.get();

		if (userExists) {
			return setError(form, "email", "Username already exists.");
		}

		const userId = generateId(15);
		const hashedPassword = await new Argon2id().hash(form.data.password);

		const { id, email } = db
			.insert(usersTable)
			.values({ email: form.data.email, id: userId })
			.returning({ id: usersTable.id, email: usersTable.email })
			.get();

		db.insert(accountsTable).values({
			id,
			hashedPassword,
		});

		const session = await lucia.createSession(id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes,
		});

		await sendVerificationEmail(email);

		redirect(302, "/verify-email");
	},
};
