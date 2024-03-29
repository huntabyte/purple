import { createLikeSchema, deleteLikeSchema } from "$lib/zod-schemas";
import { fail, redirect, type RequestEvent } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { db } from "./db";
import { likesTable } from "./schemas";
import { and, eq } from "drizzle-orm";

export async function createLikeAction(event: RequestEvent) {
	if (!event.locals.user) redirect(303, "/login");

	const form = await superValidate(event.url, zod(createLikeSchema));

	if (!form.valid) {
		return fail(400, {
			createLikeForm: form,
		});
	}

	try {
		const [like] = await getPostLikeByUser(form.data.postId, event.locals.user.id);
		if (like) throw new Error();

		await db.insert(likesTable).values({
			postId: form.data.postId,
			userId: event.locals.user.id,
		});
	} catch (e) {
		setError(form, "An error occurred while liking the post. Please try again later.");
	}

	return {
		createLikeForm: form,
	};
}

async function getPostLikeByUser(postId: string, userId: string) {
	return await db
		.select()
		.from(likesTable)
		.where(and(eq(likesTable.postId, postId), eq(likesTable.userId, userId)))
		.limit(1);
}

export async function deleteLikeAction(event: RequestEvent) {
	if (!event.locals.user) redirect(303, "/login");

	const form = await superValidate(event.url, zod(deleteLikeSchema));

	if (!form.valid) {
		return fail(400, {
			deleteLikeForm: form,
		});
	}

	// check if the user has liked the post
	try {
		const [like] = await getPostLikeByUser(form.data.postId, event.locals.user.id);
		console.log(like);
		if (!like) throw new Error();

		await db
			.delete(likesTable)
			.where(and(eq(likesTable.id, like.id), eq(likesTable.userId, event.locals.user.id)));
	} catch {
		setError(form, "An error occurred while unliking the post. Please try again later.");
	}

	return {
		deleteLikeForm: form,
	};
}
