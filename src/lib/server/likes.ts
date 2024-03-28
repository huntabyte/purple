import { createLikeSchema, deleteLikeSchema } from "$lib/zod-schemas";
import { fail, redirect, type RequestEvent } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { db } from "./db";
import { likesTable } from "./schemas";
import { eq } from "drizzle-orm";

export async function createLikeAction(event: RequestEvent) {
	if (!event.locals.user) redirect(303, "/login");

	const form = await superValidate(event.url, zod(createLikeSchema));

	if (!form.valid) {
		return fail(400, {
			createLikeForm: form,
		});
	}

	try {
		await db.insert(likesTable).values({
			postId: form.data.postId,
			userId: event.locals.user.id,
		});
	} catch (e) {
		setError(form, "", "An error occurred while liking the post. Please try again later.");
	}

	return {
		createLikeForm: form,
	};
}

export async function deleteLikeAction(event: RequestEvent) {
	if (!event.locals.user) redirect(303, "/login");

	const form = await superValidate(event.url, zod(deleteLikeSchema));

	if (!form.valid) {
		return fail(400, {
			deleteLikeForm: form,
		});
	}

	try {
		await db.delete(likesTable).where(eq(likesTable.id, form.data.likeId));
	} catch {
		setError(form, "", "An error occurred while unliking the post. Please try again later.");
	}

	return {
		deleteLikeForm: form,
	};
}
