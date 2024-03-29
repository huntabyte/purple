import { createPostCommentSchema } from "$lib/zod-schemas";
import { error, fail, redirect, type RequestEvent } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { db } from "./db";
import { commentsTable } from "./schemas";
import { getPostById } from "./posts";

export async function createCommentAction(event: RequestEvent) {
	if (!event.locals.user) redirect(302, "/login");
	const form = await superValidate(event, zod(createPostCommentSchema));
	if (!form.valid) {
		return fail(400, { createCommentForm: form });
	}

	const postId = event.url.searchParams.get("postId");
	if (!postId) error(400, "Invalid postId");

	const post = await getPostById(postId, event.locals.user.id);

	if (!post) error(400, "Invalid post");

	await db.insert(commentsTable).values({ ...form.data, postId, userId: event.locals.user.id });

	return {
		createCommentForm: form,
	};
}
